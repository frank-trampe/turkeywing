/**
 * Created by pswaminathan on 10/22/16.
 */
'use strict';

//src/services/user/hooks/aggr_user_data.js
//Aggregating(combining) user_overlay and user_private_overlay for user.

module.exports = function (options) {
    return function (hook) {
        // if orgId is available -> get private overlay

        const p_overlays = [];
        if (!hook.params.query.user_id) {
            return Promise.reject(new Error("No user_id provided"));
        }

        //find user_id in org given by organization_id  in user_private_overlay
        // ->find+ sort by created_by desc and filter top result
        if (hook.params.query.organization_id) {

            p_overlays.push(hook.app.service('user_private_overlay').find({
                query: {
                    organization_id: hook.params.query.organization_id,
                    user_id: hook.params.user._id,
                    $sort: {created_at: -1},
                    $limit: 1

                }
            }));


        }
        // find user_id in user_overlay and sort by created_by desc and filter top result
        p_overlays.push(hook.app.service('user_overlay').find({
            query: {
                user_id: hook.params.user._id,
                $sort: {created_at: -1},
                $limit: 1
            }
        }));

        // overlay
        return Promise.all(p_overlays).then(function (results) {
            //results -> two dictionaries -> one private_overlay and one user_overlay
            results.forEach(function (result) {
                // ignore created_at, created_by, _id
                const ignore_fields = ["created_at", "created_by", "_id"];
                // iterate result dictionaries -> dict merge into hook.results
                for (var key in result) {
                    if (!(key in ignore_fields)) {
                        hook.result.key = result[key];
                    }
                }
            });

        }).then(results => {
            return Promise.resolve(hook);
        });
        //return Promise.resolve(hook);
    };
};

