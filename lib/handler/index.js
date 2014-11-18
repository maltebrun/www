// Usually expects "db" as an injected dependency to manipulate the models
module.exports = function (db) {
	console.log('setting up handlers...');

	return function (handler) {
		return {
			renderdata: function (view, data) {
				return function (req, res) {
					res.render(view, data);
				}
			},
			redirect: function (url) {
				return function (req, res) {
					res.redirect(url);
				}
			}
		}[handler];
	};
};
