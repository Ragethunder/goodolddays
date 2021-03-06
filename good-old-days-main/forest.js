var colorLerp = require('../node_modules/color-lerp');

'use strict';

class Forest
{
    constructor(size, index, name, worldFields, lowerAltLimit, upperAltLimit, color)
    {
        this.m_size = size;
        this.m_index = index;
        this.m_name = name + " forest";
        var x = Math.random();
        x = Math.pow(x, 0.4) / (Math.pow(x, 0.4) + Math.pow(1-x, 0.4));
        x = Math.round(x * (size - 1));
        var y = Math.random();
        y = Math.pow(y, 0.4) / (Math.pow(y, 0.4) + Math.pow(1-y, 0.4));
        y = Math.round(y * (size - 1));
        this.m_fields = [];
        if(lowerAltLimit < worldFields[x][y].m_alt && worldFields[x][y].m_alt < upperAltLimit)
        {
            this.m_fields = [[x, y]];
            this.m_motionVector = [-1 + 2 * Math.random(), -1 + 2 * Math.random()];

            var steps = 6 + 6 * Math.round(Math.random());
            console.log("Populating " + this.m_name + " by " + steps + " steps...");
            this.Populate(steps, worldFields, lowerAltLimit, upperAltLimit);

            this.m_lastExpanded = 0;
            steps = 2 + 2 * Math.round(Math.random());
            console.log("Expanding " + this.m_name + " by " + steps + " steps...");
            this.Expand(steps, worldFields, lowerAltLimit, upperAltLimit);

            this.m_color = color;
        }
    }

    Populate(steps, worldFields, lowerAltLimit, upperAltLimit)
    {
        if(steps > 0 && this.m_fields.length > 0)
        {
            var x = this.m_fields[this.m_fields.length-1][0] + Math.round(this.m_motionVector[0]);
            var y = this.m_fields[this.m_fields.length-1][1] + Math.round(this.m_motionVector[1]);
            x = Math.max(0, Math.min(x, this.m_size - 1));
            y = Math.max(0, Math.min(y, this.m_size - 1));
            if(lowerAltLimit < worldFields[x][y].m_alt && worldFields[x][y].m_alt < upperAltLimit)
            {
                this.m_fields.push([x, y]);
                this.m_motionVector[0] += -1 + 2 * Math.random();
                this.m_motionVector[1] += -1 + 2 * Math.random();
                var len = Math.sqrt(this.m_motionVector[0] * this.m_motionVector[0] + this.m_motionVector[1] * this.m_motionVector[1]);
                this.m_motionVector[0] /= len;
                this.m_motionVector[1] /= len;

                this.Populate(steps - 1, worldFields, lowerAltLimit, upperAltLimit);
            }
        }
    }

    Expand(steps, worldFields, lowerAltLimit, upperAltLimit)
    {
        if(steps > 0)
        {
            var len = this.m_fields.length;
            for(var i = this.m_lastExpanded; i<len; i++)
            {
                for(var j = -1; j<2; j++)
                {
                    for(var k = -1; k<2; k++)
                    {
                        if(i == 0 && j == 0)
                        {
                            continue;
                        }
                        var x = this.m_fields[i][0] + j;
                        var y = this.m_fields[i][1] + k;
                        if(this.m_fields.indexOf([x, y]) == -1 && x >= 0 && x < this.m_size && y >= 0 && y < this.m_size)
                        {
                            if(lowerAltLimit < worldFields[x][y].m_alt && worldFields[x][y].m_alt < upperAltLimit)
                            {
                                this.m_fields.push([x, y]);
                            }
                        }
                    }
                }
            }
            this.m_lastExpanded = len - 1;
            this.Expand(steps - 1, worldFields, lowerAltLimit, upperAltLimit);
        }
    }

    Intersect(forest)
    {
        for(var i=0; i<forest.m_fields.length; i++)
        {
            var ind = this.m_fields.indexOf(forest.m_fields[i]);
            if(ind > -1)
            {
                this.m_fields.splice(ind, 1);
            }
        }
    }
}

module.exports = Forest;

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}