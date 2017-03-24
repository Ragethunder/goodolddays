var colorLerp = require('../node_modules/color-lerp');

'use strict';

class Field
{
    constructor(x, y, alt, type, seaLevel, beachLevel, grassLevel, snowCapLevel)
    {
        this.m_x = x;
        this.m_y = y;
        this.m_alt = alt;
        this.m_type = type;
        this.m_color = '#000000';
        this.m_mineras = [];
        this.m_props = [];

        this.Colorize(seaLevel, beachLevel, grassLevel, snowCapLevel, "#4286f4", "#efebb3", "#61a049", "#ffffff");
    }

    Colorize(seaLevel, beachLevel, grassLevel, snowCapLevel, colorSea, colorbeach, colorGrass, colorSnowCap)
    {
        if(this.m_alt <= seaLevel)
        {
            this.m_alt = seaLevel;
            this.m_color = colorSea;
        }
        else if(this.m_alt <= beachLevel)
        {
            this.m_color = colorbeach;
        }
        else if(this.m_alt <= grassLevel)
        {
            var colors = colorLerp(colorbeach, colorGrass, 10);
            var index = Math.floor(9 * (this.m_alt - beachLevel) / (grassLevel - beachLevel));
            this.m_color = colors[index];
        }
        else if(this.m_alt <= snowCapLevel)
        {
            var colors = colorLerp(colorGrass, colorSnowCap, 10);
            var index = Math.floor(9 * (this.m_alt - grassLevel) / (snowCapLevel - grassLevel));
            this.m_color = colors[index];
        }
        else
        {
            this.m_color = colorSnowCap;
        }
    }

    GrowForest(index, name, color)
    {
        this.m_forestIndex = index;
        this.m_forestName = name;
        this.m_color = color;
    }

    PlantMinerals(index, name, probability)
    {
        var hasThisType = false;
        for(var i = 0; i<this.m_mineras.length; i++)
        {
            if(this.m_mineras[i].type == index)
            {
                hasThisType = true;
            }
        }
        if(!hasThisType)
        {
            this.m_mineras.push({type : index, name : name, probability : probability});
        }
    }

    PlaceProps(category, index, name, color, probability)
    {
        var hasThisType = false;
        for(var i = 0; i<this.m_props.length; i++)
        {
            if(this.m_props[i].type == index)
            {
                hasThisType = true;
            }
        }
        if(!hasThisType)
        {
            this.m_props.push({category : category, type : index, name : name, probability : probability});
        }
    }
}

module.exports = Field;