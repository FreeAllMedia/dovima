import flowsync from "flowsync";

export default function softDelete(callback) {
  flowsync.series([
    (done) => {
      this.beforeDelete(done);
    },
    (done) => {
      this.softDestroy(done);
    },
    (done) => {
      this.afterDelete(done);
    }
  ], (errors) => {
    callback(errors);
  });
}
