var simplexNoise = require('./simplex-noise');
var Field = require('./field');
var minerals = require('./minerals');
var fieldType = require('./field-type');
var forest = require('./forest');
var colorLerp = require('../node_modules/color-lerp');

'use strict';

class World
{
    constructor(size, seaLevel, beachLevel, grassLevel, snowCapLevel, forestsNames, mineralTypes, fieldTypes, wildlife, generateTrees, generateMinerals, generateProps, generateWildlife)
    {
        var noise = new simplexNoise(Math);
        this.m_size = size;
        this.m_fields = [];
        var persistance = 0.5;

        //Height subsets of the terrain
        this.m_sorted = [];

        //Terrain
        console.log("Generating heightmap...");
        var percentGenerated = 0;
        for(var i = 0; i<this.m_size; i++)
        {
            this.m_fields[i] = [];
            for(var j = 0; j<this.m_size; j++)
            {
                var dx = Math.abs(size/2 - i)/(size/2);
                var dy = Math.abs(size/2 - j)/(size/2);
                var dist = Math.min(2 - Math.sqrt(dx*dx + dy*dy) * 2, 1);
                var altitude = -3 + (Math.pow(dist, 4) / (Math.pow(dist, 4) + Math.pow(1 - dist, 4))) * 3;
                for(var k = 0; k<5; k++)
                {
                    var freq = Math.pow(2, k);
                    var amplitude = 1 - Math.pow(persistance, k);
                    altitude += noise.noise(Math.round(i / freq), Math.round(j / freq)) * amplitude;
                }
                this.m_fields[i][j] = new Field(i, j, altitude, 0, seaLevel, beachLevel, grassLevel, snowCapLevel);
            }

            var percent = Math.round(i / this.m_size * 100)
            {
                if(percent % 10 == 0 && percentGenerated != percent)
                {
                    percentGenerated = percent;
                    console.log(percent + "%...");
                }
            }
        }
        console.log("Generating sorted terrain");
        this.m_sorted = [];
        for(var i=0; i<this.m_size; i++)
        {
            this.m_sorted = this.m_sorted.concat(this.m_fields[i]);
        }
        console.log(this.m_sorted.length);
        this.m_sorted = this.m_sorted.map(function(obj){
            var robj = {};
            robj.m_alt = obj.m_alt;
            robj.m_x = obj.m_x;
            robj.m_y = obj.m_y;
            return robj;
        });
        this.m_sorted.sort(compare);
        console.log("Terrain generated");


        //Minerals
        if(generateMinerals)
        {
            console.log("Generating mineral deposits...");
            percentGenerated = 0;
            var deposits = [];
            
            var mineralColors = colorLerp("#c41d1d", "#b29b9b", mineralTypes.length);

            for(var j = 0; j<mineralTypes.length; j++)
            {
                console.log("Generating " + mineralTypes[j] + " deposits");
                var mineralsc = Math.round(this.m_size / 9 + Math.random() * this.m_size / 9)
                var mineralColor = mineralColors[j];
                for(var i = 0; i<mineralsc; i++)
                {
                    var f = new minerals(this.m_size, j, mineralTypes[j], this.m_fields, seaLevel, snowCapLevel, mineralColor);
                    if(f.m_fields.length > 0)
                    {
                        deposits.push(f);
                    }
                }
            }
            for(var i = 0; i<deposits.length; i++)
            {
                for(var j = 0; j<deposits[i].m_fields.length; j++)
                {
                    var f = deposits[i];
                    var x = f.m_fields[j][0];
                    var y = f.m_fields[j][1];
                    this.m_fields[x][y].PlantMinerals(f.m_type, f.m_name, f.m_fields[j][2]);
                }
            }
            var deposits = null;
            console.log("Mineral deposits generated");
        }

        
        //Forests
        if(generateTrees)
        {
            console.log("Generating forests...");
            percentGenerated = 0;
            var forests = Math.round(this.m_size / 12 + Math.random() * this.m_size / 12);
            var generatedForests = [];
            
            var forestColors = colorLerp("#105919", "#465910", 10);

            for(var i = 0; i<forests; i++)
            {
                var ind = Math.round(Math.random() * (forestsNames.length - 1));
                var forestColor = forestColors[Math.floor(Math.random() * (forestColors.length - 1))];
                var f = new forest(this.m_size, i, forestsNames[ind], this.m_fields, seaLevel, snowCapLevel, forestColor);
                if(f.m_fields.length > 0)
                {
                    generatedForests.push(f);
                    forestsNames.splice(ind, 1);
                }
            }
            console.log("Intersecting forests...");
            percentGenerated = 0;
            for(var i = 0; i<generatedForests.length-1; i++)
            {
                for(var j = i+1; j<generatedForests.length; j++)
                {
                    generatedForests[i].Intersect(generatedForests[j]);
                }
            }
            console.log(generatedForests.length + " forests generated");
            for(var i = 0; i<generatedForests.length; i++)
            {
                for(var j = 0; j<generatedForests[i].m_fields.length; j++)
                {
                    var f = generatedForests[i];
                    var x = f.m_fields[j][0];
                    var y = f.m_fields[j][1];
                    this.m_fields[x][y].GrowForest(f.m_index, f.m_name, f.m_color);
                }
            }
            generatedForests = null;
        }

        
        //Field Props
        if(generateProps)
        {
            console.log("Generating field props...");
            percentGenerated = 0;
            var props = [];
            
            var propColors = colorLerp("#a341f4", "#f141f4", fieldTypes.length);

            for(var j = 0; j<fieldTypes.length; j++)
            {
                console.log("Generating " + fieldTypes[j].name + " fields");
                var propc = Math.round(this.m_size / 5 + Math.random() * this.m_size / 5);
                var propColor = propColors[j];
                for(var i = 0; i<propc; i++)
                {
                    var f = new fieldType(this.m_size, j, fieldTypes[j].category, fieldTypes[j].name, fieldTypes[j].expand, this.m_fields, fieldTypes[j].lowerAltLimit, fieldTypes[j].upperAltLimit, propColor);
                    if(f.m_fields.length > 0)
                    {
                        props.push(f);
                    }
                }
            }
            for(var i = 0; i<props.length; i++)
            {
                for(var j = 0; j<props[i].m_fields.length; j++)
                {
                    var f = props[i];
                    var x = f.m_fields[j][0];
                    var y = f.m_fields[j][1];
                    this.m_fields[x][y].PlaceProps(f.m_category, f.m_type, f.m_name, f.m_color, f.m_fields[j][2]);
                }
            }
            var props = null;
            console.log("Field props generated");
        }


        //Wildlife
        if(generateWildlife)
        {
            console.log("Generating wildlife...");
            for(var i=0; i<wildlife.length; i++)
            {
                var count = Math.round(this.m_size / 20);
                count *= count;
                switch(wildlife[i].population)
                {
                case 'very low':
                    count *= 1;
                    break;
                case 'low':
                    count *= 2;
                    break;
                case 'medium':
                    count *= 3;
                    break;
                case 'high':
                    count *= 4;
                    break;
                case 'very high':
                    count *= 5;
                    break;
                }

                var hearding = wildlife[i].attitude.indexOf('hearding') != -1;
                for(var j=0; j<count; j++)
                {
                    var field = this.GetRandomPointWithinAltRange(wildlife[i].altRange[0], wildlife[i].altRange[1]);
                    if(hearding)
                    {
                        while(count > j && Math.random() < 0.4)
                        {
                            count--;
                        }
                    }
                }
            }
            console.log("Wildlife generated");
        }
    
        console.log(JSON.stringify(this.m_fields[Math.round(this.m_size/2)][Math.round(this.m_size/2)]));
        //console.log(JSON.stringify(this.m_sorted));
    }

    GetFieldInfo(x, y)
    {
        x = Math.min(0, Math.max(x, size));
        y = Math.min(0, Math.max(y, size));
        return this.m_fields[x][y];
    }

    GetRandomPointWithinAltRange(minAlt, maxAlt)
    {
        if(this.minAlt != minAlt || this.maxAlt != maxAlt)
        {
            this.minAlt = minAlt;
            this.maxAlt = maxAlt;
            this.minInd = 0;
            this.maxInd = this.m_size * this.m_size - 1;
            for(var i=0; i<this.m_size * this.m_size; i++)
            {
                if(this.m_sorted[i].m_alt < minAlt)
                {
                    this.minInd = Math.min(this.m_size * this.m_size - 1, i + 1);
                    this.minAlt = minAlt;
                }
                else if(this.m_sorted[i].m_alt > maxAlt)
                {
                    this.maxInd = i - 1;
                    this.maxAlt = maxAlt;
                    return this.m_sorted[Math.round(this.minInd + Math.random() * (i - this.minInd))];
                }
            }
        }
        return this.m_sorted[Math.round(this.minInd + Math.random() * (this.maxInd - this.minInd))];
    }

    GetGridView()
    {
        var s = '<table border="0">';
        for(var i = 0; i<this.m_size; i++)
        {
            s += "<tr>";
            for(var j = 0; j<this.m_size; j++)
            {
                s+= '<td style = "background-color:' + this.m_fields[i][j].m_color + '">' + Math.round(this.m_fields[i][j].m_alt*100)/100 + '</td>';
            }
            s += "</tr>";
        }
        s += "</table>";
        return s;
    }
}

module.exports = World;

function compare(a, b) {
  if (a.m_alt < b.m_alt) {
    return -1;
  }
  if (a.m_alt > b.m_alt) {
    return 1;
  }
  // a must be equal to b
  return 0;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}