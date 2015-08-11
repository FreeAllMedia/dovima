import Model from "../../";
import {isPresent} from "../../";
/**
 * Setup Model Examples
 */

/* Simple Example */

export class User extends Model {
  associate() {
    this.hasOne("address", Address);

    this.hasOne("postalCode", PostalCode).through("address");

    this.hasMany("photos", Photo);

    // this.hasMany("deletedPhotos", Photo)
    // 	.where("deletedAt", "!=", null);

    this.hasOne("primaryPhoto", Photo)
      .where("isPrimary", true);

    this.hasMany("photoLikes", PhotoLike);
    this.hasMany("likedPhotos", Photo).through("photoLikes");

    this.hasMany("comments", Comment).through("photos");

    this.hasMany("deletedComments", Comment).through("photos").where("comments.deletedAt", "!=", null);
  }
  validate() {
    this.ensure("photos", isPresent);
  }
}

export class Address extends Model {
  associate() {
    this.belongsTo("user", User);
    this.belongsTo("postalCode", PostalCode);
  }
  validate() {
    this.ensure("photos", isPresent);
  }
}

export class PostalCode extends Model {
  associate() {
    this.hasMany("addresses");
  }
}

export class PhotoLike {
  associate() {
    this.belongsTo("user", User);
    this.belongsTo("photo", User);
  }
  validate() {
    this.ensure("user", isPresent);
    this.ensure("photo", isPresent);
  }
}

export class Photo extends Model {
  associate() {
    this.belongsTo("user", User).ambiguous;

    this.hasMany("comments", Comment);

    this.hasMany("commentAuthors", User)
      .through("comments")
      .as("author");

    this.hasMany("photoLikes", PhotoLike);


    this.hasMany("likedByUsers", User)
      .through("photoLikes");
  }

  validate() {
    this.ensure("user", isPresent);
  }
}

export class Comment extends Model {
  associate() {
    this.belongsTo("photo", Photo);
    this.belongsTo("author", User);
  }
}
