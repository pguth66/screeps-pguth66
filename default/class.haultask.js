/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('class.haultask');
 * mod.thing == 'a thing'; // true
 */

module.exports = class HaulTask {
    constructor (resource, source, destination, targetAmount) {
        this.resource = resource;
        this.source = source;
        this.destination = destination;
        this.amount = targetAmount;
    }
};