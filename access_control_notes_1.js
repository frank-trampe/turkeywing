// Copyright 2016 by Frank Trampe

// The agency table maps users to their privileges over organizations.
// Fields are user_id, organization_id, access_level, created_at, created_by, destroyed_at, destroyed_by.
// The authority table maps users and organizations to records.
// Fields are accessor_class, accessor_id, target_class, target_id, access_level, created_at, created_by, destroyed_at, destroyed_by.

security = {};

security.validateInputData = function(app, schema, input, strict) {
	// Check that required fields are present.
	var tkey;
	for (tkey in schema) {
		if ('required' in tkey && tkey.required && !(tkey in input))
			return Promise.reject(new Error("Missing field."));
	}
	// Validate each field.
	var checks = [];
	for (tkey in input) {
		if (tkey in schema) {
			if (input[tkey] == null) {
				if ('allow_null' in schema[ikey] && schema[ikey].allow_null) { } else {
					checks.push(Promise.reject(new Error("Null field.")));
					pass;
				}
			} else if ('type' in schema[ikey]) {
				if (typeof(input[ikey]) != schema[ikey].type) {
					checks.push(Promise.reject(new Error("Mismatched field type.")));
					pass;
				}
			}
			if (1 && 'user_writable' in schema[ikey] && !(schema[ikey].user_writable)) {
				checks.push(Promise.reject(new Error("Cannot write this field.")));
				pass;
			}
			if ('validation' in schema[ikey]) {
				// Use feathers-validator.
				var tvalidator = new Validator(data, schema);
				var terrs = tvalidator.errors();
				if (terrs.length > 0) {
					checks.push(Promise.reject(new Error("Validation error.")));
					pass;
				}
			}
			if ('target_class' in schema[ikey]) {
				// Check that a pointed record exists.
				checks.push(app.service(schema[ikey].target_class).get(input[ikey]));
			}
		} else if (strict) {
			// For now, reject any record with a field not defined in the schema.
			checks.push(Promise.reject(new Error("Extraneous field.")));
		} 
	}
};
//  user_id, organization_id, access_level, created_at, created_by, destroyed_at, destroyed_by.
// {accessor_class: {type: 'string', required: 1, is_class: 1}, accessor_id: {type: 'string', required: 1}, target_class: {type: 'string', required: 1, is_class: 1}, target_id: {type: 'string', required: 1}, access_level: {type: 'number', required: 1}, created_at: {type: 'date', user_writable: 0}, created_by: {type: 'string', target_class: 'users', user_writable: 0}, destroyed_at: {type: 'date', user_writable: 0}, destroyed_by: {type: 'string', target_class: 'users', user_writable: 0}
// Levels
// 2 read.
// 4 write.
// 8 control.
// Users and authorities are special cases.
// We will not access-check authorities.
// We will allow any user with agency over any organization so see all users.

security.validateInput = function(class_name, input) {
	return this.validateInputData(this.app, this.schema['class_name'].fields, input, this.schema['class_name'].strict);
}

security.schema = {
	user_overlay: {
		/* This stores basic user information. But it has a time stamp, and we always use the most recent data. */
		/* These records are shared among all service providers. */
		strict: 1, /* This means to disallow non-listed fields. */
		fields: {
			_id: {type: 'string', is_primary_key: true, user_writable: 0},
			/* This is the user that the overlay describes. */
			user_id: {type: 'string', required: 1, validation: 'alpha_dash|required|min:1', target_class: 'users', human_name: "User ID"},
			name_first: {type: 'string', required: 1, validation: 'alpha_dash|required', human_name: "First Name"},
			name_middle: {type: 'string', required: 1, validation: 'alpha_dash|required', human_name: "Middle Name"},
			name_last: {type: 'string', required: 1, validation: 'alpha_dash|required|min:1', human_name: "Last Name"},
			created_at: {type: 'date', user_writable: 0},
			created_by: {type: 'string', target_class: 'users', user_writable: 0}
		}
	},
	user_private_overlay: {
		/* This stores user information specific to a collecting organization. */
		/* It is always generated in parallel with a general overlay, so it references that overlay. */
		/* It has the strict flag set to 0, so it can have whatever fields the creator likes. */
		strict: 0,
		fields : {
			_id: {type: 'string', is_primary_key: true, user_writable: 0},
			user_id: {type: 'string', required: 1, validation: 'alpha_dash|required|min:1', target_class: 'users', human_name: "User ID"},
			user_overlay_id: {type: 'string', required: 1, validation: 'alpha_dash|required|min:1', target_class: 'user_overlays', human_name: "Overlay ID"},
			/* This sets the organization that owns the overlay. The organization gets access regardless of authority records. */
			organization_id: {type: 'string', required: 1, validation: 'alpha_dash|required|min:1', target_class: 'organizations', human_name: "Organization ID"},
			created_at: {type: 'date', user_writable: 0},
			created_by: {type: 'string', target_class: 'users', user_writable: 0}
		}
	},
	user_private_overlay_schema: {
		/* This stores a template for user information specific to a collecting organization. */
		/* It is always generated in parallel with a general overlay, so it references that overlay. */
		/* It has the strict flag set to 0, so it can have whatever fields the creator likes. */
		strict: 1,
		fields : {
			_id: {type: 'string', is_primary_key: true, user_writable: 0},
			schema: {type: 'object'},
			/* This sets the organization that owns the overlay. The organization gets access regardless of authority records. */
			organization_id: {type: 'string', required: 1, validation: 'alpha_dash|required|min:1', target_class: 'organizations', human_name: "Organization ID"},
			created_at: {type: 'date', user_writable: 0},
			created_by: {type: 'string', target_class: 'users', user_writable: 0}
		}
	},
	organization: {
		strict: 1,
		fields : {
			_id: {type: 'string', is_primary_key: true, user_writable: 0},
			name: {type: 'string', required: 1, validation: 'alpha_dash|required|min:1', human_name: "Name"},
			is_provider: {type: 'number', human_name: "Is Provider"}
		}
	},
	general_service: {
		strict: 1,
		fields : {
			_id: {type: 'string', is_primary_key: true, user_writable: 0},
			name: {type: 'string', required: 1, validation: 'alpha_dash|required|min:1', human_name: "Name"},
			/* This is the organization that provides/owns the service. */
			organization_id: {type: 'string', required: 1, validation: 'alpha_dash|required|min:1', target_class: 'organizations', human_name: "Organization ID"},
			location_latitude: {type: 'number', human_name: "Latitude"},
			location_longitude: {type: 'number', human_name: "Longitude"},
			/* Start and end times are relative to the day in question in the time zone of the location. */
			start_time: {type: 'date', user_writable: 1, human_name: "Start Time"},
			end_time: {type: 'date', user_writable: 1, human_name: "End Time"},
			/* This is a bitfield of seven entries. */
			recur_weekdays: {type: 'number', human_name: "Days Available"},
			/* This is the number of people that each instance of the service can accommodate. */
			capacity: {type: 'number', human_name: "Capacity"},
			no_overbooking: {type: 'number', human_name: "No Overbooking"},
			/* This is a bitfield. 1 for men, 2 for women, 4 for other. Combine as necessary. */
			sex: {type: 'number', required: 1, allow_null: 1, human_name: "Sex"},
			/* If the age window is defined, the service is restricted to people whose age fits in the window. */
			age_start: {type: 'date', required: 1, allow_null: 1, human_name: "Minimum Age"},
			age_end: {type: 'date', required: 1, allow_null: 1, human_name: "Maximum Age"},
			/* If the service window is defined, the service is restricted to people whose service overlaps the window. */
			military_service_start: {type: 'date', required: 1, allow_null: 1, human_name: "Military Service Window Start"},
			military_service_end: {type: 'date', required: 1, allow_null: 1, human_name: "Military Service Window Start"},
			created_at: {type: 'date', user_writable: 0},
			created_by: {type: 'string', target_class: 'users', user_writable: 0},
			destroyed_at: {type: 'date', user_writable: 0},
			destroyed_by: {type: 'string', target_class: 'users', user_writable: 0}
		}
	},
	specific_service: {
		strict: 1,
		fields : {
			_id: {type: 'string', is_primary_key: true, user_writable: 0},
			name: {type: 'string', required: 1, validation: 'alpha_dash', human_name: "Name"},
			general_service_id: {type: 'string', required: 1, validation: 'alpha_dash', target_class: 'general_services', human_name: "General Service ID"},
			/* This is the organization that provides/owns the service. */
			organization_id: {type: 'string', required: 1, validation: 'alpha_dash', target_class: 'organizations', human_name: "Organization ID"},
			location_latitude: {type: 'number', human_name: "Latitude"},
			location_longitude: {type: 'number', human_name: "Longitude"},
			/* Start and end times are absolute. */
			start_time: {type: 'date', user_writable: 1, human_name: "Start Time"},
			end_time: {type: 'date', user_writable: 1, human_name: "End Time"},
			capacity: {type: 'number', human_name: "Capacity"},
			no_overbooking: {type: 'number', human_name: "No Overbooking"},
			created_at: {type: 'date', user_writable: 0},
			created_by: {type: 'string', target_class: 'users', user_writable: 0},
			destroyed_at: {type: 'date', user_writable: 0},
			destroyed_by: {type: 'string', target_class: 'users', user_writable: 0}
		}
	},
	general_note: {
		strict: 1,
		fields : {
			_id: {type: 'string', is_primary_key: true, user_writable: 0},
			/* This is the user about whom the note is written. */
			topic_user: {type: 'string', target_class: 'users', user_writable: 1},
			content: {type: 'string', required: 1, validation: 'alpha_dash', human_name: "Content"},
			/* This is 1 for user-only visibililty, 2 for organization-only visibility, 4 for service-provider-only visibility. */
			scope: {type: 'number'},
			attachment_id:{type: 'string', target_class: 'uploads', user_writable: 1},
			created_at: {type: 'date', user_writable: 0},
			created_by: {type: 'string', target_class: 'users', user_writable: 0},
			destroyed_at: {type: 'date', user_writable: 0},
			destroyed_by: {type: 'string', target_class: 'users', user_writable: 0}
		}
	},
	communication_event: {
			_id: {type: 'string', is_primary_key: true, user_writable: 0},
			content: {type: 'string', validation: 'alpha_dash', human_name: "Content"},
			from_user_id: {type: 'string', required: 1, validation: 'alpha_dash', target_class: 'users', human_name: "User ID"},
			to_user_id: {type: 'string', required: 1, validation: 'alpha_dash', target_class: 'users', human_name: "User ID"}
	}
};

// TODO: Unify the security functions into an object.
// require that object into the app as app.security.
// Add the schema to security as app.security.schema.
// Add a function for user-access-user logic. If the accessing user has agency over a service provider organization and the accessed user has no agency, the accessing user can set/reset account information for the accessed user.
// Add a function that validates/authorizes user changes.
// Add a service that provides schema.
// Make hooks.

security.checkAuthority = function(accClass, accId, tClass, tId) {
	var thisC = this;
	// I always control myself.
	if (accClass == tClass && accId == tId) return Promise.resolve(1 | 2 | 4 | 8);
	// Find authority records.
	var delegated = thisC.app.service('authorities').find({query: {accessor_class: accClass, accessor_id: accId, target_class: tClass, target_id: tId, destroyed_at: null}}).then(
		function (rvs) {
			var priv = 0;
			rvs.forEach(
				function (val, ind, arr) {
					priv |= val.access_level;
				}
			);
			return Promise.resolve(priv);
		}, function (err) { return Promise.reject(err); }
	);
	// Infer special privileges.
	var special = null;
	if (tClass == 'general_note') {
		// Check audience.
	} else if (tClass == 'communication_events') {
		// Allow only sender and recipient.
		special = thisC.app.service('communication_events').get(tId).then(
			function (rv) {
				if ('from_user_id' in rv && accClass == 'users' && accId == rv.from_user_id) {
					return Promise.resolve(0x3);
				} else if ('to_user_id' in rv && accClass == 'users' && accId == rv.to_user_id) {
					return Promise.resolve(0x3);
				}
				return Promise.resolve(0x0);
			}, function (err) {
				console.log("Error fetching communication_event in checkAuthority.");
				return Promise.resolve(0);
			}
		);
	} else if (tClass == 'organizations' || tClass == 'general_services' || tClass == 'specific_services') {
		// Allow everybody.
		special = Promise.resolve(0x3);
	} else if (tClass == 'user_overlays' && accessorClass == 'organizations') {
		// Allow any service provider.
		special = thisC.app.service('organizations').get(accessorId).then(
			function (rv) {
				if ('is_provider' in rv && rv.is_provider) {
					return Promise.resolve(0x3);
				}
				return Promise.resolve(0x0);
			}, function (err) {
				console.log("Error fetching organization in checkAuthority.");
				return Promise.resolve(0);
			}
		);
	} else if (tClass == 'user_private_overlays' && accClass == 'organizations') {
		// Allow the associated organization.
		special = thisC.app.service('user_private_overlays').get(tId).then(
			function (rv) {
				if ('organization_id' in rv && rv.organization_id == accId) {
					return Promise.resolve(0x3);
				}
				return Promise.resolve(0x0);
			}, function (err) {
				console.log("Error fetching user_private_overlay in checkAuthority.");
				return Promise.resolve(0);
			}
		);
	} else {
		special = Promise.resolve(0);
	}
	return Promise.all([delegated, special]).then(
		function (rvs) { return Promise.resolve(rvs[0] | rvs[1]); },
		function (err) { return Promise.reject(err); }
	);
};

security.checkAgencyAuthority = function(userId, tClass, tId) {
	var thisC = this;
	// Find all active agency relationships for the user.
	var general = thisC.app.service('agencies').find({query: {user_id: userId, destroyed_at: null}}).then(
		function (rvs) {
			// For each organization over which the user has agency, find its authority over the target.
			var privs = [];
			rvs.forEach(
				function (val, ind, arr) {
					privs.push(thisC.checkAuthority('organizations', val.organization_id, tClass, tId).then(
						function (rv) { return Promise.resolve(rv & val.access_level); },
						function (err) { return Promise.reject(err); }
					));
				}
			);
			return Promise.all(privs).then(
				function (rvs) {
					var priv = 0;
					rvs.forEach(
						function (val, ind, arr) {
							priv |= val;
						}
					);
					return Promise.resolve(priv);
				}
			);
		}
	);
	// There are special user-specific privileges.
	// An alternative to this approach would be to run checkAuthority with the user as the accessor and to combine that result with the general result.
	var special = null;
	if (tClass == 'communication_events') {
		// Allow only sender and recipient.
		special = thisC.app.service('communication_events').get(tId).then(
			function (rv) {
				if ('from_user_id' in rv && userId == rv.from_user_id) {
					return Promise.resolve(0x3);
				} else if ('to_user_id' in rv && userId == rv.to_user_id) {
					return Promise.resolve(0x3);
				}
				return Promise.resolve(0x0);
			}, function (err) {
				console.log("Error fetching communication_event in checkAgencyAuthority.");
				return Promise.resolve(0);
			}
		);
	} else {
		special = Promise.resolve(0);
	}
	return Promise.all([general, special]).then(
		function (rvs) {
			return Promise.resolve(rvs[0] | rvs[1]);
		},
		function (err) { return Promise.reject(err); }
	);
};

security.getUserOrganizations = function(userId, tClass, tId) {
	var thisC = this;
	// Find all active agency relationships for the user.
	return thisC.app.service('agencies').find({query: {user_id: userId, destroyed_at: null}}).then(
		function (rvs) {
			// Return a list of organizations over which the user has agency.
			var orgs = [];
			rvs.forEach(
				function (val, ind, arr) {
					if (val.access_level > 0) orgs.push(val.organization_id);
				}
			);
			return orgs;
		}
	);
};

security.multiGet = function(tClass, tIds) {
	var tasks = [];
	var thisC = this;
	tIds.forEach(
		function (val, ind, arr) {
			tasks.push(thisC.app.service(tClass).get(val));
		}
	);
	return Promise.all(tasks);
};

security.accessFilter = function(aClass, aId, tClass, tData) {
	// tData is an array of already fetched items of class tClass.
	var thisC = this;
	var outputs = [];
	if (aClass == 'organizations') {
		tData.forEach(function (val, ind, arr) {
			outputs.push(thisC.checkAuthority(aClass, aId, tClass, val._id).then(
				function (rv) {
					if ((rv & aLevel) == aLevel) {
						return Promise.resolve(val);
					} else {
						return Promise.resolve(null);
					}
				},
				function (err) { return Promise.resolve(null); }
			));
		});		
	} else if (aClass == 'users') {
		tData.forEach(function (val, ind, arr) {
			outputs.push(thisC.checkAgencyAuthority(aId, tClass, val._id).then(
				function (rv) { 
					if (rv & 0x03) {
						return Promise.resolve(val);
					} else {
						return Promise.resolve(null);
					}
				},
				function (err) { return Promise.resolve(null); }
			));
		});
	}
	if (outputs.length > 0) {
		return Promise.all(outputs).then(function (rvs) {
			var output = [];
			rvs.forEach(function (val, ind, arr) { if (val != null) output.push(val); });
		});
	}
	return Promise.resolve([]);
};

security.doWithLock = function (lock, write, task) {
	// Task must return a promise, even on error, in order to avoid deadlock.
	// This function will wait for the requested lock in the requested mode.
	// It will then run the task and use the result of the promise from the task after releasing the lock.
	// This function returns a promise which resolves/rejects according to the result of the promise from task.
	return new Promise(function (resolve, reject) {
		if (write) {
			lock.writeLock(
				function (release) {
					task().then(
						function (result) { release(); resolve(result); },
						function (err) { release(); reject(err); }
					);
				}
			);
		} else {
			lock.readLock(
				function (release) {
					task().then(
						function (result) { release(); resolve(result); },
						function (err) { release(); reject(err); }
					);
				}
			);
		}
	});
}

security.hookReadLock = function (hook) {
	// This takes out the application-wide read lock and stashes the unlock function.
	hook.app.security.lock.readLock(
		function (release) {
			hook.lock_r = release;
		}
	);
	return hook;
};
security.hookWriteLock = function (hook) {
	// This takes out the application-wide write lock and stashes the unlock function.
	hook.app.security.lock.writeLock(
		function (release) {
			hook.lock_r = release;
		}
	);
	return hook;
};
security.hookUnlock = function (hook) {
	// This uses the stashed unlock function to release the application-wide lock.
	if ('lock_r' in hook.app.security) {
		hook.lock_r();
	}
	return hook;
};

function orgprivCreate(app) {
	var rv = {};
	for (var el in security) {
		rv[el] = security[el];
	}
	rv['app'] = app;
	return rv;
}

exports = module.exports = {create: orgprivCreate, doWithLock: security.doWithLock, hookReadLock: security.hookReadLock, hookWriteLock: security.hookWriteLock, hookUnlock: security.hookUnlock};

// We need more hooks.
// The hooks register in src/services/(service_name)/hooks/index.js.
// A hook function takes the hook as its argument.
// It returns that hook or a promise resolving to the hook or rejecting to an error.
// https://docs.feathersjs.com/hooks/readme.html
// A before hook can abort a read or a write (such as when permissions are lacking) by returning a rejected promise.
// An after hook can abort a read in that fashion also.
// An after hook can add information to a read by adding to the hook.result object.

// We will have a general read hook that calls checkAgencyAuthority, which already handles the special cases.
// Writing is more complicated, and we will have a separate hook function for each of several cases.
// Creating a general service requires write access to the parent organization.
// Creating a note or a user overlay requires that one be a member of a service provider organization.
// Creating a private user overlay requires membership in the organization owning the private overlay.
// A user can change his password.
// A member of a service provider organization can create a user and change a user's password.
// Frank will handle all of these.

// Requesting a user attaches the organizations to which the user belongs.
// This will use getUserOrganizations and multiGet on the server side.
// hook.app.security.getUserOrganizations(function (rvs) { return hook.app.security.multiGet('organizations', rvs); })
// .then(function (rvs) { hook.result.organizations = rvs });
// The client will display a menu allowing the active user to switch between organizations to which he belongs.
// It will then transmit active_organization_id as part of each query.

// We also need hooks in order to support overlays.
// Accessing a user must pull in the most recent overlay for that user and the most recent private overlay visible to the accessing user.
// The request from the client will specify the organization_id. The hook will check the user's access to the organization, check that the organization is a service provider, and then attach the extra information to the response.
// https://docs.feathersjs.com/hooks/examples.html#fetching-related-items

// For entering data, there is one more wrinkle. We must support custom schema per organization.
// user_private_overlay_schema contains a field named schema that contains a schema object.
// It follows the format of the security.schema entries.
// We will not check automatically for now, but it will not contain any object subfields.
// We will use the user_private_overlay_schema in order to generate a dynamic form 

