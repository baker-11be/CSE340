const showHome = (req, res) => {
    res.render('home', { title: 'Home' });
};

const showAbout = (req, res) => {
    res.render('about', { title: 'About Us' });
};

const showSuccessStories = (req, res) => {
    res.render('success-stories', { title: 'Success Stories' });
};

export { showHome, showAbout, showSuccessStories };
