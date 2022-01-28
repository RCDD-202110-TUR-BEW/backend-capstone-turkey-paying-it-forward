module.exports = {
    signInUser: (req, res) => {
        res.send('You successfully signed in');
    },
    signUpUser: (req, res) => {
        res.send('You successfully signed up');
    },
    signOutUser: (req, res) => {
        res.send('You successfully signed out');
    }
};