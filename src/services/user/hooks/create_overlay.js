/**
 * Created by pswaminathan on 10/22/16.
 */
'use strict';

//src/services/user/hooks/create_overlay.js
//Creating user_overlay, user_private_overlay when create/update user

//hook.custom.private_overlay_id

module.exports = function (options) {
    return function (hook) {


        if (!hook.data) {
            return Promise.reject(new Error("No direct uploads."));
        }
        const ignore_fields = ["created_at", "created_by", "_id"];
        const is_org_id = hook.params.query.organization_id ? true : false;
        var user_overlay = {};
        var user_private_overlay = {};
        var user_private_overlay_schemas = [Promise.resolve(0)];
        if (is_org_id) {
            user_private_overlay_schemas.push(hook.app.service('user_private_overlay_schema').find({
                query: {
                    organization_id: hook.params.query.organization_id,
                    $limit: 1
                }
            }));
        }
        /*each field in hook.data*/
        for (var key in hook.data) {
            // ignore created_at, created_by, _id
            if (key in ignore_fields) continue;

            // add those fields that belong to user_overlay to that dict
            if (key in app.security.schema.user_overlay.fields) {
                user_overlay[key] = hook.data[key];
            }
        }

        return Promise.all(user_private_overlay_schemas).then(function (schemas) {
            if (schemas.length() > 0) {
                var schema = schemas[0];

                for (var key in hook.data) {
                    if (key in ignore_fields) continue;
                    if (key in schema.fields) {
                        user_private_overlay[key] = hook.data[key];
                    }
                }

                hook.custom.user_overlay = user_overlay;
                hook.custom.user_private_overlay = user_private_overlay;

            }

        }).then(results => {
            return Promise.resolve(hook);
        });

    };
};

