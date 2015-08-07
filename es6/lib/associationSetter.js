const ambiguous = Symbol(),
	dependent = Symbol();

export default class AssociationSetter {
	constructor(association) {
		this.association = association;

		switch(association.type) {
			case "belongsTo":
				Object.defineProperties(this, {
					"ambiguous": {
						get: this[ambiguous]
					}
				});
				break;
			case "hasOne":
			case "hasMany":
				Object.defineProperties(this, {
					"dependent": {
						get: this[dependent]
					}
				});
				break;
		}
	}

	foreignName(name) {
		this.association.foreignName = name;
		return this;
	}

	where(...options) {
		this.association.where = options;
		return this;
	}

	andWhere(...options) {
		this.association.andWhere = this.association.andWhere || [];
		this.association.andWhere.push(options);
		return this;
	}

	through(associationName) {
		this.association.through = associationName;
		return this;
	}

	as(associationName) {
		this.association.as = associationName;
		return this;
	}

	[ambiguous]() {
		this.association.ambiguous = true;
	}

	[dependent]() {
		this.association.dependent = true;
	}
}
