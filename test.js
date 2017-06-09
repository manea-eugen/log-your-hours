var nodegit = require("nodegit"),
    path = require("path");
var repo = null;
// This code walks the history of the master branch and prints results
// that look very similar to calling `git log` from the command line

nodegit.Repository.open(path.resolve(__dirname, "/data/projects/ibood-pimcore/.git"))
    .then(function(r) {
        repo = r;
        return repo.getReferenceNames(nodegit.Reference.TYPE.LISTALL);
    })
    .then(function (branchNames) {
        for (var i = 0, len = branchNames.length; i < len; i++) {
            var branchName = branchNames[i];
            return repo.getBranchCommit(branchName);
        }
    })
    .then(function(firstCommitInBranch) {
            var history = firstCommitInBranch.history(nodegit.Revwalk.SORT.Time);

            // History emits "commit" event for each commit in the branch's history
            history.on("commit", function(commit) {
                console.log("commit " + commit.sha());
                console.log("Author:", commit.author().name() +
                    " <" + commit.author().email() + ">");
                console.log("Date:", commit.date());
                console.log("\n    " + commit.message());
            });

            // Don't forget to call `start()`!
            history.start();
    })
    .done();