(() => {
    let uvPfx = "/uv/";
    // check if config is loaded in context of service worker or not
    let loc = self.location.pathname.includes(uvPfx)
        ? self.location.pathname.substring(
              0,
              self.location.pathname.indexOf(uvPfx),
          )
        : self.location.pathname.substring(
              0,
              self.location.pathname.lastIndexOf("/"),
          );

    self.__uv$config = {
        prefix: loc + uvPfx + "service/",
        encodeUrl: Ultraviolet.codec.xor.encode,
        decodeUrl: Ultraviolet.codec.xor.decode,
        handler: loc + uvPfx + "uv.handler.js",
        client: loc + uvPfx + "uv.client.js",
        bundle: loc + uvPfx + "uv.bundle.js",
        config: loc + uvPfx + "uv.config.js",
        sw: loc + uvPfx + "uv.sw.js",
        stockSW: loc + uvPfx + "sw.js",
        loc: loc,
    };
})();
