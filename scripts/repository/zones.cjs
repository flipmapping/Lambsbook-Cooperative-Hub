'use strict';

const ZONES = Object.freeze({
  production:["client","server","shared","supabase"],
  execution:["execution"],
  recovery:[".recovery"],
  ephemeral:["dist",".cache",".tmp",".builder"]
});

function classify(path){
  return null;
}

module.exports={ZONES,classify};
