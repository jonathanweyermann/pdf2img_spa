export default function FileStatus(path) {
  try {
    var http = new XMLHttpRequest();
    http.open('HEAD', path, false);
    http.send();
    return http.status;
  } catch (err) {
    console.log(`err: ${err}`);
   return null;
  }
}
