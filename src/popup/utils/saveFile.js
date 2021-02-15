/* globals cordova */

const downloadBrowserUrl = (fileName, data) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
}
const checkFilePermission = () => {
    let perms = ["android.permission.MANAGE_EXTERNAL_STORAGE",
    ]
    let permissions = cordova.plugins.permissions;
    permissions.checkPermission("android.permission.MANAGE_EXTERNAL_STORAGE", function (status) {
        console.log('success checking permission');
        console.log('HAS MANAGE_EXTERNAL_STORAGE:', status.hasPermission);
        console.warn(status.hasPermission);
        if (!status.hasPermission) {
            permissions.requestPermissions(perms, function (status) {
                console.log('success requesting MANAGE_EXTERNAL_STORAGEN permission');
            }, function (err) {
                console.log('failed to set permission');
            });
        }
    }, function (err) {
        console.log(err);
    });
}

const writeFile = (path, filename, blob)=> {
    return new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (dirpar) {
            dirpar.getDirectory(path, { create: true }, function (dir) {
                dir.getFile(filename, { create: true, exclusive: false }, function (fileEntry) {
                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.onwriteend = () =>{
                            // console.log("Successful file write...");
                            // console.log("=========================");
                            // console.log("=========================");
                            // console.log("=========================");
                            // console.log("=========================");
                            // console.log("=========================");
                            // console.log(JSON.stringify(fileEntry));
                            // console.log(fileEntry.fullPath);
                            return resolve
                        }
                        fileWriter.onerror = reject
                        fileWriter.write(blob);
                    });
                }, reject);
            }, reject);
        }, reject);
    });
}

export default (fileName, blob) => {
    let resVal = true
        switch (process.env.PLATFORM) {
        case 'extension-chrome':
        case 'extension-firefox': {
            downloadBrowserUrl(fileName, blob)
            resVal =true
            break;
        }
        case 'cordova':
            document.addEventListener('deviceready', () => {
                checkFilePermission()

                // writeFile('download/hypersign',fileName, blob)
                // .then(res => {
                //     console.log('File Downloaded sucessfulley')
                //     resVal = true

                // })
                // .catch(err => {
                //     console.warn('Error in file download')
                //     console.log(JSON.stringify(err));
                //     resVal = false
                // })
            });
            break;
        case 'web':
            downloadBrowserUrl(fileName, blob)
            resVal = true
            break;
        default:
            throw new Error(`Unknown platform: ${process.env.PLATFORM}`);
        }
    return resVal
};
