export default function weather(day, desc, icon, data) {
	this.day = day;
    this.desc = desc;
    this.icon = icon;
	this.data = data;
}

weather.prototype.getDay = function getDay() {
    return this.day;
}

weather.prototype.getDescription = function getDescription() {
    return this.desc;
}

weather.prototype.icon = function icon() {
    return this.icon;
}

weather.prototype.getData = function getData() { 
    return this.data;
}