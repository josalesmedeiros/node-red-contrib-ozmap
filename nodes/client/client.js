module.exports = function (RED) {
  function client(config) {
    RED.nodes.createNode(this, config);

    this.ozmapconnection = RED.nodes.getNode(config.ozmapconnection);
    this.status({});
    this.on('input', async (msg) => {
      let ozmap = msg.ozmap || this.ozmapconnection.ozmap;
      if (!ozmap.isConnected()) {
        msg.payload = 'Ozmap not connected!';
        this.status({ fill: 'red', shape: 'ring', text: 'disconnected' });
        return this.send([null, msg]);
      }
      try {
        if (msg.payload.query) {
          const query = JSON.parse(msg.payload.query);
          msg.payload = await ozmap.getClient().getAllByQuery(query);
        } else if (msg.payload.filters) {
          msg.payload = await ozmap.getClient().getAllByFilter(msg.payload.filters);
        } else if (msg.payload.ids) {
          msg.payload = await ozmap.getClient().getByIds(msg.payload.ids);
        } else {
          msg.payload = await ozmap.getClient().getAll();
        }

        return this.send([msg, null]);
      } catch (error) {
        msg.payload = error;
        return this.send([null, msg]);
      }
    });
  }
  RED.nodes.registerType('client', client);
};
