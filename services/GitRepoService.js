var nodegit = require("nodegit");
var GitEntryModel = require('../models/GitEntryModel.js');
var path = require("path");

// var odb;
// var repo;
// var walker;

var GitRepoService = {

    fetchGitInfo: function () {
        var repo = null;
        var pathToRepo = path.resolve("/data/projects/ibood-pimcore");

        // God will make sure this function executes
        GitEntryModel.remove({}, function (err, row) {
            if (err) {
                console.log("Collection couldn't be removed" + err);
                return;
            }

            console.log("collection removed");
        });

        nodegit.Repository.open(pathToRepo)
            .then(function (r) {
                repo = r;
                return repo.getReferenceNames(nodegit.Reference.TYPE.LISTALL);
            })
            .then(function (branchNames) {

                var promises = [];

                for (var i = 0, len = branchNames.length; i < len; i++) {
                    var branchName = branchNames[i];
                    if (branchName.indexOf('heads') === -1) {
                        continue; // Only the local branches
                    }
                    promises.push(repo.getBranchCommit(branchName));
                }
                return Promise.all(promises);

            })
            .then(function (firstCommitInBranches) {

                for (var i = 0, len = firstCommitInBranches.length; i < len; i++) {
                    // Better solution http://radek.io/2015/10/27/nodegit/
                    var history = firstCommitInBranches[i].history(nodegit.Revwalk.SORT.Time);

                    // History emits "commit" event for each commit in the branch's history
                    history.on("commit", function (commit) {

                        // Persist it
                        var query = {commitSha: commit.sha()},
                            data = {
                                commitSha: commit.sha(),
                                authorName: commit.author().name(),
                                authorEmail: commit.author().email(),
                                message: commit.message().slice(0, -2),
                                commitDate: commit.date(),

                                createdAt: new Date(),
                                updatedAt: new Date()
                            },
                            options = {upsert: true},
                            callback = function (err, resultUp) {
                                if (err) {
                                    // Expected duplicate entry
                                    // console.log('Error while update/insert :' + err)
                                    return null;
                                }
                                process.stdout.write('.');
                                // console.log('Updated/Inserted commit :'  + data.commitSha)
                            };


                        GitEntryModel.findOne(query, function (err, result) {
                            if (result !== null) {
                                GitEntryModel.update(query, data, options, callback);
                            } else {
                                var gitEntry = new GitEntryModel(data);
                                gitEntry.save(callback);
                            }
                        })


                    });

                    // Don't forget to call `start()`!
                    history.start();
                }
            })
            .done();
    }
};


module.exports = GitRepoService;