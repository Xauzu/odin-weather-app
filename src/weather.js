export default function Weather(month, day, desc, icon, data) {
    this.month = month;
    this.day = day;
    this.desc = desc;
    this.icon = icon;
	this.data = data; // min, max, humidity, precipitation
}

Weather.prototype.getDate = function getDate() {
    return this.date;
}

Weather.prototype.getDescription = function getDescription() {
    return this.desc;
}

Weather.prototype.icon = function icon() {
    return this.icon;
}

Weather.prototype.getData = function getData() { 
    return this.data;
}