var url = require('url');

module.exports = function(arbo) {

	// Nombre de vues
	//var n = arbo.length;

	// Profondeur de l'arborescence
	var d = (function(arbo) {
		for (var i = 0, n = arbo.length, d = 0; i < n; i++) {
			(d < arbo[i].tree.length) ? arbo[i].tree.length : d;
		}
	})(arbo);

	// Pour chaque vue, calcule la route complète
	(function(arbo) {
		for (var i = 0, n = arbo.length; i < n; i++) {
			arbo[i].fullroute = "";
			for (var j = 0, m = arbo[i].tree.length - 1; j < m; j++) {
				for (var k = 0, f = false; k < n && f == false; k++) {
					if (arbo[k].tree.length - 1 == j && (function() {for (l = 0, g = true; l <= j && g == true; l++) {g = (arbo[i].tree[l] == arbo[k].tree[l])}; return g;})()) {
						f = true;
						arbo[i].fullroute += arbo[k].route + "/";
					};
				};
			};
			arbo[i].fullroute += arbo[i].route;
			if (arbo[i].fullroute == "") {arbo[i].fullroute = "/"};
		};
	})(arbo);

	var indexByname = function(name) {
		var index = -1;
		for (var i = 0, n = arbo.length; i < n; i++) {
			if (arbo[i].name == name) {
				index = i;
	     	};
		};
		return i;
	};

/*
// a priori inutile et faux (duplication possible de route dans arbo, il faut se baser sur fullroute)
	var indexByroute = function(route) {
		var i = 0;
		while (route !== arbo[i].route && i < n) {
			i++;
		};
		return (i < n) ? i : -1;
	};
*/

	var routeIndexes = function(path) {
		var pathArray = (path == "/") ? [""] : path.split('/'); // split('/') renvoie ["", ""] alors qu'on veut [""]
		var indexArray = [];
		for (var i = 0, m = pathArray.length, f = true; i < m && f == true; i++) {
			for (var j = 0, n = arbo.length, g = false; j < n && g == false; j++) {
				if (pathArray[i] == arbo[j].route && arbo[j].tree.length - 1 == i && ((i == 0) ? true : beginsByArray(arbo[j].tree, arbo[indexArray[i - 1]].tree))) {
					g = true;
					indexArray[i] = j;
				};
			};
			f = g;
		};
		return f ? indexArray : null;
	};

	var url2path = function(urlfrom) {
		return url.parse(urlfrom).pathname;
	};

	var compareArray = function(a, b) {
		// renvoie 0 si les 2 tableaux sont identiques, -1 si a < b, 1 si a > b, la comparaison s'effectuant sur le premier élément différent entre a et b.
		// Si l'un des 2 tableaux est le début de l'autre alors il lui est inférieur
		for (var i = 0, r = 0, p = a.length, q = b.length; i < p && i < q && r == 0; i++) {
			r = (a[i] > b[i]) ? 1 : ((a[i] < b[i]) ? -1 : 0);
		};
		return r;
	};

	var sameArray = function(a, b) {
		// renvoie vrai si les 2 tableaux sont identiques
		for (var i = 0, p = a.length, q = b.length, f = (p == q); f && (i < p); i++) {
			f = (a[i] == b[i]);
		};
		return f;
	};

	var sameFatherArray = function(a, b) {
		// renvoie vrai si les 2 tableaux sont de meme taille et identiques jusqu'au rang n-1
		for (var i = 0, p = a.length, q = b.length, f = (p == q); f && (i < p - 1); i++) {
			f = (a[i] == b[i]);
		};
		return f;
	};

	var beginsByArray = function(a, b) {
		// renvoie vrai si le tableau a commence par les éléments du tableau b
		for (var i = 0, p = a.length, q = b.length, f = (p >= q); i < q && f; i++) {
			f = (a[i] == b[i]);
		};
		return f;
	};

	var oneBeginsByArray = function(a, b) {
		// renvoie vrai si un des 2 tableaux commence par les éléments de l'autre
		for (var i = 0, p = a.length, q = b.length, f = true; i < p && i < q && f; i++) {
			f = (a[i] == b[i]);
		};
		return f;
	};

/*
	var getBreadcrumb = function(indexes) {
		var result = [];
		for (var i = 0, n = indexes.length, s = ""; i < n; i++, s += "/") {
			s += arbo[indexes[i]].route;
			result[i] = {"url": s, "title": arbo[indexes[i]].title, "subtitle": arbo[indexes[i]].subtitle, "active": (i == (n - 1))};
		};
		return result;
	};
*/

	var getBreadcrumb = function(indexes) {
		for (var i = 0, n = indexes.length, result = []; i < n; i++) {
			result[i] = {"tree": arbo[i].tree, "url": arbo[indexes[i]].fullroute, "title": arbo[indexes[i]].title, "subtitle": arbo[indexes[i]].subtitle, "active": (i == (n - 1))};
		};
		return result;
	};

	var getCurrentitems = function(indexes) {
		var result = [];
		t = arbo[indexes[indexes.length - 1]].tree;
		for (var i = 0, j = 0, n = arbo.length; i < n; i++) {
//			if (arbo[i].tree.length == t.length && (function() {for (var k = 0, f = true; k < t.length - 1; k++) {f = (arbo[i].tree[j] == t[j])}; return f;})()) {
			if (sameFatherArray(arbo[i].tree, t)) {
				result[j] = {"tree": arbo[i].tree, "url": arbo[i].fullroute, "title": arbo[i].title, "subtitle": arbo[i].subtitle, "active": (i == indexes[indexes.length - 1]), "dropdown": arbo[i].dropdown, "subitems": []};
				if (arbo[i].dropdown) {
					result[j].subitems = getChilditemsfromtree(arbo[i].tree);
				};
				j++;
			};
		};
		return result.sort(function (a, b) {return compareArray(a.tree, b.tree);});
	};

	var getHeaditems = function(indexes) {
		var result = [];
		t = arbo[indexes[indexes.length - 1]].tree;
		for (var i = 0, j = 0, n = arbo.length; i < n; i++) {
			if ((arbo[i].tree.length == 2) && (t[0] == arbo[i].tree[0])) {
				result[j] = {"tree": arbo[i].tree, "url": arbo[i].fullroute, "title": arbo[i].title, "subtitle": arbo[i].subtitle, "active": ((indexes.length < 2) ? false : (i == indexes[1]))};
				j++;
			};
		};
		return result.sort(function (a, b) {return compareArray(a.tree, b.tree);});
	};

	var getChilditemsfromtree = function(tree) {
		var result = [];
		for (var i = 0, j = 0, n = arbo.length; i < n; i++) {
			if ((arbo[i].tree.length == tree.length + 1) && beginsByArray(arbo[i].tree, tree)) {
				result[j] = {"tree": arbo[i].tree, "url": arbo[i].fullroute, "title": arbo[i].title, "subtitle": arbo[i].subtitle, "active": false};
				j++;
			};
		};
		return result.sort(function (a, b) {return compareArray(a.tree, b.tree);});
	};

	var getChilditemsfromindexes = function(indexes) {
		return getChilditemsfromtree(arbo[indexes[indexes.length - 1]].tree);
	};

	var getMainmenu = function(indexes) {
		var result = [];
		t = arbo[indexes[indexes.length - 1]].tree;
		for (var i = 0, j = 0, n = arbo.length; i < n; i++) {
			if ((arbo[i].tree.length == 2) && (t[0] == arbo[i].tree[0])) {
				result[j] = {"tree": arbo[i].tree, "url": arbo[i].fullroute, "title": arbo[i].title, "subtitle": arbo[i].subtitle, "active": ((indexes.length < 2) ? false : (i == indexes[1])), "dropdown": arbo[i].dropdown, "subitems": []};
				if (arbo[i].dropdown) {
					result[j].subitems = getChilditemsfromtree(arbo[i].tree);
				};
				j++;
			};
			if ((arbo[i].tree.length == 1) && (t[0] == arbo[i].tree[0])) {
				result[j] = {"tree": arbo[i].tree, "url": arbo[i].fullroute, "title": arbo[i].title, "subtitle": arbo[i].subtitle, "active": ((indexes.length == 1) ? (i == indexes[0]) : false), "dropdown": false, "subitems": []};
				j++;
			};
		};
		return result.sort(function (a, b) {return compareArray(a.tree, b.tree);});
	}

/*	var getChilditems = function(indexes) {
		var result = [];
		var t = arbo[indexes[indexes.length - 1]].tree;
		for (var i = 0, j = 0, n = arbo.length; i < n; i++) {
			if ((arbo[i].tree.length == t.length + 1) && beginsByArray(arbo[i].tree, t)) {
				result[j] = {"tree": arbo[i].tree, "url": arbo[i].fullroute, "title": arbo[i].title, "subtitle": arbo[i].subtitle, "active": false};
				j++;
			};
		};
		return result.sort(function (a, b) {return compareArray(a.tree, b.tree);});
	};
*/
	var getChilditems = getChilditemsfromindexes;

	var getFatheritems = function(indexes) {
		var n = indexes.length;
		return (n > 1) ? getCurrentitems(indexes.slice(0, n - 1)) : [];
	};

	return {
		"arbo" : arbo,
		"headitems" : (function (item) {
			return function(req, res, next) {
				res.locals.headitems = getHeaditems(routeIndexes(url2path(req.originalUrl)));
				next();
			};
		}) ()
		,
		"mainmenu" : (function (item) {
			return function(req, res, next) {
				res.locals.mainmenu = getMainmenu(routeIndexes(url2path(req.originalUrl)));
				next();
			};
		}) ()
		,
		"currentitems" : (function (item) {
			return function(req, res, next) {
				res.locals.currentitems = getCurrentitems(routeIndexes(url2path(req.originalUrl)));
				next();
			};
		}) ()
		,
		"childitems" : (function (item) {
			return function(req, res, next) {
				res.locals.childitems = getChilditems(routeIndexes(url2path(req.originalUrl)));
				next();
			};
		}) ()
		,
		"fatheritems" : (function (item) {
			return function(req, res, next) {
				res.locals.fatheritems = getFatheritems(routeIndexes(url2path(req.originalUrl)));
				next();
			};
		}) ()
		,
		"breadcrumb" : (function () {
			return function(req, res, next) {
				res.locals.breadcrumb = getBreadcrumb(routeIndexes(url2path(req.originalUrl)));
				next();
			};
		}) ()
		,
		"route" : (function (path) {
			return function(req, res, next) {
				res.locals.route = url.parse(req.originalUrl).pathname;
				next();
			};
		}) ()
	}
};