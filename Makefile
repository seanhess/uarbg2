all: build-ts

build-ts:
	tsc --out public/main.js public/app.ts


