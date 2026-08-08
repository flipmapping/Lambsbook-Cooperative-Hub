'use strict';

const fs = require('fs');
const path = require('path');

const {
  MAX_DEPTH,
  FOLLOW_SYMLINKS
} = require('./contracts.cjs');

function scan(options = {}) {

  const {
    root,
    visitor
  } = options;

  if (!root)
    throw new Error("scan(): missing root");

  if (typeof visitor !== "function")
    throw new Error("scan(): visitor callback required");

  const visited = new Set();

  walk(path.resolve(root),0);

  function walk(dir,depth){

    if(depth > MAX_DEPTH)
      throw new Error(
        `Traversal depth exceeded (${MAX_DEPTH}) : ${dir}`
      );

    let real;

    try{
      real = fs.realpathSync(dir);
    }catch{
      return;
    }

    if(visited.has(real))
      return;

    visited.add(real);

    let entries;

    try{
      entries = fs.readdirSync(
        dir,
        {withFileTypes:true}
      );
    }catch{
      return;
    }

    entries.sort(
      (a,b)=>a.name.localeCompare(b.name)
    );

    for(const entry of entries){

      const full = path.join(dir,entry.name);

      if(entry.isSymbolicLink() && !FOLLOW_SYMLINKS)
        continue;

      if(entry.isDirectory()){

        walk(full,depth+1);

        continue;
      }

      visitor(full,entry);

    }

  }

}

module.exports = {
  scan
};
