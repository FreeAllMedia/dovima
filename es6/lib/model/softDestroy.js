import privateData from "incognito";

export default function softDestroy(callback) {
  const _ = privateData(this);
  if (_.mockDelete) {
    callback();
  } else {
    this.deletedAt = Date.now;
    this.save(callback);
  }
}
