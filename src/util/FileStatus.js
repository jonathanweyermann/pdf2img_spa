export default function FileStatus(path) {
  try {
    console.log("hello")
    var http = new XMLHttpRequest();
    console.log("http" + http)
    http.open('HEAD', path, false);
    http.send();
    console.log("httpstatus" + http.status)
    return http.status;
  } catch (err) {
    console.log(`err: ${err}`);
   return null;
  }
}
