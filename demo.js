window.onload = function() {
	var images = [];

	function load_file(file) {
		var reader = new FileReader();
		reader.onload = function (event) {
			var img = new Image()
			img.src = reader.result;
			var hash = pHash(img);
			var hash_hex = parseInt(hash, 2).toString(16);
			img.hash = hash;
			img.hash_hex = hash_hex;

			img.pos = images.length;
			img.vel = 0;
			img.acc = 0;

			document.body.appendChild(img);

			// for(var i = 0; i < images.length; i++){
			// 	var other = images[i].hash;
			// 	var diff = distance(other, hash)
			// }

			images.push(img);

		};
		console.log("File: " + file);
		reader.readAsDataURL(file);

	}

	document.body.ondragover = function () { this.className = 'hover'; return false; };
	document.body.ondragend = function () { this.className = ''; return false; };
	document.body.ondrop = function (e) {
		this.className = '';
		e.preventDefault();

		var files = e.dataTransfer.files;

		for (var i = 0; i < files.length; i++) {
			load_file(files[i]);
		}

		return false;
	};

	// var dict = "abcdefghijklmnopqrstuwxyz"
	// function distance(a, b){
	// 	return Math.abs(a - b)
	// }
	// dict.split('').sort(function(a,b){
	// 	return Math.random() - 0.5; // oh knuth gods strike me down
	// }).map(function(el, i){
	// 	var span = document.createElement('span')
	// 	span.innerHTML = el;
	// 	span.hash = dict.indexOf(el);
	// 	span.pos = i;
	// 	span.vel = 0;
	// 	document.body.appendChild(span)
	// 	images.push(span)
	// })


	function one_force() {
		var energy = 0;

		for (var i = 0; i < images.length; i++) {
			images[i].acc = 0;
		}
		for (var i = 0; i < images.length; i++) {
			for (var j = 0; j < images.length; j++) {
				if (i == j) continue;

				var diff = distance(images[i].hash, images[j].hash);
				var dist = images[j].pos - images[i].pos;

				energy += Math.abs(dist) * diff;
				// diff ~ repulsion
				// similarity ~ attraction
				images[i].acc += 0.01 * dist;

				console.log(i, j, diff)
			}
		}
		for (var i = 0; i < images.length; i++) {
			images[i].vel += images[i].acc;
		}
		for (var i = 0; i < images.length; i++) {
			images[i].pos += images[i].vel;
		}

		images.sort(function (a, b) {
			return a.pos - b.pos
		}).forEach(function (e) {
			document.body.appendChild(e)
		})
		console.log(energy)
	}

	function set_thresh(val) {
		var divs = document.getElementsByTagName('div');
		while (divs[0]) {
			divs[0].parentNode.removeChild(divs[0])
		}
		equivalence_classes(images, function (a, b) {
			console.log(distance(a.hash, b.hash))
			return distance(a.hash, b.hash) < val
		}).sort(function (b, a) {
			return a.length - b.length
		}).forEach(function (group) {
			var div = document.createElement('div');
			group.forEach(function (img) {
				div.appendChild(img)
			})
			document.body.appendChild(div)
		})

	}


	// this is a port of something from libccv which
	// is a port of something from opencv which is 
	// a port of an algorithm in some textbook from
	// somewhere

	// it has rough functional parity with ccv_array_group
	// and cvSeqPartition and the union-find algorithm
	// except rather than returning a list of list 
	// indicies in case one is so inclined to construct
	// a list, it actually just returns the list

	// this is a quadratic algorithm as far as I'm aware
	// which means that the is_equal function will be called
	// n(n - 1) times where n is the length of your elements
	// array. For things with large numbers of elements,
	// this can become very slow.

	// it might be wise because of this to inform the
	// algorithm with some notion of geometry. i.e.
	// "these elements are really really far apart
	// so they probably don't have anything to do with
	// each other so lets just kind of let them do
	// their thing and have incestuous relations with
	// people closer to them"

	function equivalence_classes(elements, is_equal) {
		var node = []
		for (var i = 0; i < elements.length; i++) {
			node.push({
				parent: 0,
				element: elements[i],
				rank: 0
			})
		}
		for (var i = 0; i < node.length; i++) {
			var root = node[i]
			while (root.parent) {
				root = root.parent;
			}
			for (var j = 0; j < node.length; j++) {
				if (i == j) continue;
				if (!is_equal(node[i].element, node[j].element)) continue;
				var root2 = node[j];
				while (root2.parent) {
					root2 = root2.parent;
				}
				if (root2 != root) {
					if (root.rank > root2.rank) {
						root2.parent = root;
					} else {
						root.parent = root2;
						if (root.rank == root2.rank) {
							root2.rank++
						}
						root = root2;
					}
					var node2 = node[j];
					while (node2.parent) {
						var temp = node2;
						node2 = node2.parent;
						temp.parent = root;
					}
					var node2 = node[i];
					while (node2.parent) {
						var temp = node2;
						node2 = node2.parent;
						temp.parent = root;
					}
				}
			}
		}
		var index = 0;
		var clusters = [];
		for (var i = 0; i < node.length; i++) {
			var j = -1;
			var node1 = node[i]
			while (node1.parent) {
				node1 = node1.parent
			}
			if (node1.rank >= 0) {
				node1.rank = ~index++;
			}
			j = ~node1.rank;

			if (clusters[j]) {
				clusters[j].push(elements[i])
			} else {
				clusters[j] = [elements[i]]
			}
		}
		return clusters;
	}	
}
