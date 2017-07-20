var nodegit = require("nodegit");
var RepoModel = require('../models/RepoModel.js');
var fs = require("fs");
var GitEntryModel = require('../models/GitEntryModel.js');
var path = require("path");


var GitRepoService = {
    repo: null,
    me: this,
    clearOldGitEntries: function (RepoModel) {
        GitEntryModel.remove({repo: RepoModel}, function (err, row) {
            if (err) {
                console.log("Collection couldn't be removed" + err);
                return;
            }

            // console.log("collection removed");
        });
    },

    // getAllRepoPaths: function (srcPath) {
    //     var gitRepos = [];
    //     fs.readdirSync(srcPath)
    //         .filter(function (file) {
    //             var fullpath = path.join(srcPath, file, '.git');
    //             if (fs.existsSync(fullpath)) {
    //                 gitRepos.push(fullpath);
    //             }
    //         })
    //     return gitRepos;
    // },
    openRepoCallback: function (r) {
        this.repo = r;
        return this.repo.getReferences(nodegit.Reference.TYPE.LISTALL);
    },

    getBranchesCallback: function (branches) {

        var promises = [];

        // console.log('Current repo' + repo.path);return;

        for (var i = 0, len = branches.length; i < len; i++) {




            /** @var {Reference} reference*/
            var reference = branches[i];
            var branchName = reference.name();
            if(
                !reference.isBranch() ||
                reference.isRemote() ||
                !nodegit.Reference.hasLog(this.repo, branchName)
            ){
                continue;
                // console.log('has log' + nodegit.Reference.hasLog(this.repo,branches[i].toString()))

                // console.log('Has log' + reference.hasLog())
            }
            // console.log('Found valid branch ' + reference.name())

            if(branchName == 'refs/remotes/origin/development'){
               console.log(reference.name())
            }
            // console.log(branches[i].toString());
            // var string = branches[i].shorthand();
            // console.log(string);
            // console.log(branches[i].isConcrete());
            // console.log(branches[i].isValid());
            // console.log(branches[i]);



// isTag ,isRemote , isNote, isBranch

            if (branchName.indexOf('heads') === -1) {
                continue; // Only the local branches
            }
            promises.push(this.repo.getReferenceCommit(reference.name()));

        }


        // return;
        //
        // for (var i = 0, len = branchNames.length; i < len; i++) {
        //     var branchName = branchNames[i];
        //     if (branchName.indexOf('heads') === -1) {
        //         continue; // Only the local branches
        //     }
            promises.push(this.repo.getBranchCommit(branchName));
        // }
        return Promise.all(promises);

    },
    /**
     * @param {RepoModel} RepoModel
     * @param {Repository} commit
     */
    onFindCommitCallback: function (RepoModel, commit) {

        // Persist it
        var query = {commitSha: commit.sha()},
            data = {
                commitSha: commit.sha(),
                authorName: commit.author().name(),
                authorEmail: commit.author().email(),
                message: commit.message().slice(0, -2),
                commitDate: commit.date(),

                createdAt: new Date(),
                updatedAt: new Date(),
                repo: RepoModel
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


    },
    getFirstCommitCallback: function (RepoModel, firstCommitInBranches) {
        // console.log(RepoModel);
        // console.log(firstCommitInBranches);
        for (var i = 0, len = firstCommitInBranches.length; i < len; i++) {
            // Better solution http://radek.io/2015/10/27/nodegit/
            var history = firstCommitInBranches[i].history(nodegit.Revwalk.SORT.Time);

            // History emits "commit" event for each commit in the branch's history
            history.on("commit", this.onFindCommitCallback.bind(this, RepoModel));

            // Don't forget to call `start()`!
            history.start();
        }
    },

    /**
     * @param {RepoModel} RepoModel
     */
    fetchGitInfo: function (RepoModel) {
        var me = this;

        this.clearOldGitEntries(RepoModel);

        nodegit.Repository
            .open(RepoModel.path)
            .then(me.openRepoCallback.bind(me))
            .then(me.getBranchesCallback.bind(me))
            .then(me.getFirstCommitCallback.bind(me, RepoModel))
            .done();
    }
};


module.exports = GitRepoService;