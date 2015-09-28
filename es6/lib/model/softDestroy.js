import privateData from "incognito";
import Datetime from "fleming";

export default function softDestroy(callback) {
  const _ = privateData(this);
  if (_.mockDelete) {
    callback();
  } else {
    this.deletedAt = new Datetime().toDate();
    this.save(callback);
  }
}
