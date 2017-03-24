'use strict';

class Animal
{
    constructor(species, name, maxPhysique, travelSpeed, attitude, attractedTo)
    {
        this.m_species = species;
        this.m_type = type;
        this.m_maxPhysique = maxPhysique;
        switch(travelSpeed)
        {
        case 'very slow':
            this.m_movementSpeed = 0.25;
            break;
        case 'slow':
            this.m_movementSpeed = 0.66;
            break;
        case 'normal':
            this.m_movementSpeed = 1;
            break;
        case 'fast':
            this.m_movementSpeed = 1.5;
            break;
        case 'very fast':
            this.m_movementSpeed = 2;
            break;
        }
        this.m_attitude = attitude;
        this.m_attractedTo = attractedTo;
    }
}

module.exports = Minerals;