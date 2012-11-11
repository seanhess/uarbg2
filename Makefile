all: build

build:
	tsc --out public/main.js public/app.ts

install:
	npm install && bower install




