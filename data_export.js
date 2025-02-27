function getData(filePath){
	const fs = require('fs');
	let rawdata = fs.readFileSync(filePath);
	return JSON.parse(rawdata);
}

module.exports.getData = getData;