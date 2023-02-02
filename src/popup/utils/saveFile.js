/* globals cordova */

const downloadBrowserUrl = (fileName, data) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
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

export default async (fileName, blob) => {
  switch (process.env.PLATFORM) {
    case 'extension-chrome':
    case 'extension-firefox': {
          downloadBrowserUrl(fileName, blob)
      break;
    }
    case 'cordova':
      document.addEventListener('deviceready', () => {
         writeFile('download/hypersign',fileName, blob)
         .then(res => {
             console.log('File Downloaded sucessfulley')
         })
         .catch(err => {
             console.warn('Error in file download')
            //  console.log(JSON.stringify(err));
         })
      });
      break;
    case 'web':
        downloadBrowserUrl(fileName, blob)
      break;
    default:
      throw new Error(`Unknown platform: ${process.env.PLATFORM}`);
  }
};
