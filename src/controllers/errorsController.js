const showNotFound = (req, res) => {
    res.status(404).render('404', { title: 'Page not found' });
};

const showServerError = (error, req, res, next) => {
    console.error(`Request failed for ${req.method} ${req.path}:`, error);
    if (res.headersSent) {
        return next(error);
    }

    res.status(500).render('500', { title: 'Something went wrong' });
};

export { showNotFound, showServerError };
