###PhotoWall - readme
(c) James Padolsey
http://james.padolsey.com

---

PhotoWall creates a container (`<div>`) filled with images you specify
The images will each be positioned in a way to avoid gaps in the
container and to maximise space. If you haven't already, I suggest
you check out the online demo.

---

Include the script in your document:

    <script src="path/to/photowall.js"></script>

Instantiate a PhotoWall:

    <script>
        new PhotoWall({
            imgs: [
                'path/to/img1.jpg',
                'path/to/img2.jpg',
                'path/to/img3.jpg',
                '...more images...'
            ],
            inject: function() {
                // Append the PhotoWall to the <body>
                document.body.appendChild(this);
            }
        })
    </script>

Above we've used the "imgs" and "inject" options. There are some other
options, including:

            width : A number indicating the width of the container
           height : A number indicating the width of the container
      maxImgWidth : A number indicating the max width of each individual image
     maxImgHeight : A number indicating the max height of each individual image
      minImgWidth : A number indicating the min width of each individual image
     minImgHeight : A number indicating the min height of each individual image

