var colorLerp = require('../node_modules/color-lerp');

'use strict';

class Minerals
{
    constructor(size, type, name, worldFields, lowerAltLimit, upperAltLimit, color)
    {
        this.m_size = size;
        this.m_type = type;
        this.m_name = name + " deposit";
        this.m_probability = 0.5 + Math.random() * 0.5;
        var x = Math.random();
        x = Math.pow(x, 0.4) / (Math.pow(x, 0.4) + Math.pow(1-x, 0.4));
        x = Math.round(x * (size - 1));
        var y = Math.random();
        y = Math.pow(y, 0.4) / (Math.pow(y, 0.4) + Math.pow(1-y, 0.4));
        y = Math.round(y * (size - 1));
        this.m_fields = [];
        if(lowerAltLimit < worldFields[x][y].m_alt && worldFields[x][y].m_alt < upperAltLimit)
        {
            this.m_fields = [[x, y, this.m_probability]];

            var steps = 3 * Math.round(Math.random());
            this.Expand(steps, worldFields, lowerAltLimit, upperAltLimit);

            this.m_color = color;
        }
    }

    Expand(steps, worldFields, lowerAltLimit, upperAltLimit)
    {
        if(steps > 0)
        {
            var len = this.m_fields.length;
            for(var i = 0; i<len; i++)
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
                        if(this.m_fields.indexOf([x, y, this.m_probability * (1 - 0.75 / Math.max(1, steps))]) == -1 && x >= 0 && x < this.m_size && y >= 0 && y < this.m_size)
                        {
                            if(lowerAltLimit < worldFields[x][y].m_alt && worldFields[x][y].m_alt < upperAltLimit)
                            {
                                this.m_fields.push([x, y, this.m_probability * (1 - 0.75 / Math.max(1, steps))]);
                            }
                        }
                    }
                }
            }
            this.Expand(steps - 1, worldFields, lowerAltLimit, upperAltLimit);
        }
    }
}

module.exports = Minerals;