var fs = require('fs');

function readFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isFile()){
            files_.push(name);
        }
    }
    return files_;
}

function getFiles(path) {
	var dir = './public/images/'+path;
	files_ = readFiles(dir);
	var fileSize = files_.length;
	var num = Math.floor( Math.random() * fileSize);
	var img = files_[num];
	return img;
}

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

exports.getFiles = getFiles;
exports.readFiles = readFiles;
exports.base64_encode = base64_encode;