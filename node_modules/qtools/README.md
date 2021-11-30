### Stop!! Do Not Use This.

This pile was written in the early days of NodeJS. Before we really had any good idea of what good code was. Well, before *I* had any idea of what good code was.

This thing, it is referred to as ‘qtools’ in my world, has served me very well. It is a library of functions that I used so often that it was worth carrying them all around for most of a decade.

Eventually the modern age became apparent. There are so many things I do not like about this now and I have gone another direction. *(Look for ‘qtools’ on npm. There are some things that make me feel proud, or at least, that I find useful.)* This is deprecated, with prejudice.

Some of its required packages have vulnerabilities that I have ignored as long as I can. I finally bit the bullet (I’m still stuck with some old projects, too) and have revised this to update the ones that github says I must and I have cleaned it up a little in a refactoring sort of way.

If you are a person who inherited old software of mine, this package can be cloned to replace the existing node_modules/qtools (after backing it up! difficulty in updating it reliably is a major reason it is in the dustbin of history) and it will (should?) work. 

If you are not, don’t use this.

In you do, you will probably want to add to your package.json since I never did back in the day.

I suggest adding…

`qtools": “”`

To the dependencies clause. npm will bitch when you update but it will not delete it. Small blessings.

Good luck.

TQ White II

Ps, check out the byObjectProperty() method in qtoolsBase. It’s a helper for sorting Javascript arrays that is killer. I love it so much that I included it in my qtools-functional-library package on npm.
