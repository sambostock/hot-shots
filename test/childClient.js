const assert = require('assert');
const helpers = require('./helpers/helpers.js');

const StatsD = require('../lib/statsd');

const closeAll = helpers.closeAll;
const testProtocolTypes = helpers.testTypes;
const createServer = helpers.createServer;
const createHotShotsClient = helpers.createHotShotsClient;

describe('#childClient', () => {
  let server;
  let statsd;

  afterEach(done => {
    closeAll(server, statsd, false, done);
    server = null;
    statsd = null;
  });

  testProtocolTypes().forEach(([description, serverType, clientType]) => {

    describe(description, () => {
      it('init should set the proper values when specified', () => {
        // if we don't null out the server first, and try to close it again, we get an uncatchable error when using uds
        server = null;

        statsd = new StatsD(
          'host', 1234, 'prefix', 'suffix', true, null, true, ['gtag', 'tag1:234234']
        );

        const child = statsd.childClient({
          prefix: 'preff.',
          suffix: '.suff',
          globalTags: ['awesomeness:over9000', 'tag1:xxx', 'bar', ':baz']
        });

        assert.strictEqual(child.prefix, 'preff.prefix.');
        assert.strictEqual(child.suffix, '.suffix.suff');
        assert.strictEqual(statsd, global.statsd);
        assert.deepEqual(child.globalTags, ['gtag', 'awesomeness:over9000', 'tag1:xxx', 'bar', ':baz']);
      });
    });

    it('childClient should add tags, prefix and suffix without parent values', done => {
      server = createServer(serverType, opts => {
          statsd = createHotShotsClient(Object.assign(opts, {
            maxBufferSize: 500,
          }), clientType).childClient({
            prefix: 'preff.',
            suffix: '.suff',
            globalTags: ['awesomeness:over9000']
          });
          statsd.increment('a', 1);
          statsd.increment('b', 2);
      });
      server.on('metrics', metrics => {
        assert.strictEqual(metrics, 'preff.a.suff:1|c|#awesomeness:over9000\npreff.b.suff:2|c|#awesomeness:over9000\n');
        done();
      });
    });

    it('should add tags, prefix and suffix with parent values', done => {
      server = createServer(serverType, opts => {
        statsd = createHotShotsClient(Object.assign(opts, {
          prefix: 'p.',
          suffix: '.s',
          globalTags: ['xyz'],
          maxBufferSize: 500,
        }), clientType).childClient({
          prefix: 'preff.',
          suffix: '.suff',
          globalTags: ['awesomeness:over9000']
        });
        statsd.increment('a', 1);
        statsd.increment('b', 2);
      });
      server.on('metrics', metrics => {
        assert.strictEqual(metrics, 'preff.p.a.s.suff:1|c|#xyz,awesomeness:' +
          'over9000\npreff.p.b.s.suff:2|c|#xyz,awesomeness:over9000\n'
        );
        done();
      });
    });

    [
      {
        parentString: null,
        parentSeparator: null,
        childString: null,
        childSeparator: null,
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: null,
        childString: null,
        childSeparator: '',
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: null,
        childString: null,
        childSeparator: '__',
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: null,
        childString: '',
        childSeparator: null,
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: null,
        childString: '',
        childSeparator: '',
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: null,
        childString: '',
        childSeparator: '__',
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: null,
        childString: 'child',
        childSeparator: null,
        prefix: 'child.',
        suffix: '.child',
      },
      {
        parentString: null,
        parentSeparator: null,
        childString: 'child',
        childSeparator: '',
        prefix: 'child',
        suffix: 'child',
      },
      {
        parentString: null,
        parentSeparator: null,
        childString: 'child',
        childSeparator: '__',
        prefix: 'child__',
        suffix: '__child',
      },
      {
        parentString: null,
        parentSeparator: '',
        childString: null,
        childSeparator: null,
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: '',
        childString: null,
        childSeparator: '',
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: '',
        childString: null,
        childSeparator: '__',
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: '',
        childString: '',
        childSeparator: null,
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: '',
        childString: '',
        childSeparator: '',
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: '',
        childString: '',
        childSeparator: '__',
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: '',
        childString: 'child',
        childSeparator: null,
        prefix: 'child.',
        suffix: '.child',
      },
      {
        parentString: null,
        parentSeparator: '',
        childString: 'child',
        childSeparator: '',
        prefix: 'child.',
        suffix: '.child',
      },
      {
        parentString: null,
        parentSeparator: '',
        childString: 'child',
        childSeparator: '__',
        prefix: 'child__',
        suffix: '__child',
      },
      {
        parentString: null,
        parentSeparator: '__',
        childString: null,
        childSeparator: null,
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: '__',
        childString: null,
        childSeparator: '',
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: '__',
        childString: null,
        childSeparator: '__',
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: '__',
        childString: '',
        childSeparator: null,
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: '__',
        childString: '',
        childSeparator: '',
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: '__',
        childString: '',
        childSeparator: '__',
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: '__',
        childString: 'child',
        childSeparator: null,
        prefix: '',
        suffix: '',
      },
      {
        parentString: null,
        parentSeparator: '__',
        childString: 'child',
        childSeparator: '',
        prefix: 'child.',
        suffix: '.child',
      },
      {
        parentString: null,
        parentSeparator: '__',
        childString: 'child',
        childSeparator: '__',
        prefix: 'child__',
        suffix: '__child',
      },
      {
        parentString: '',
        parentSeparator: null,
        childString: null,
        childSeparator: null,
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: null,
        childString: null,
        childSeparator: '',
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: null,
        childString: null,
        childSeparator: '__',
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: null,
        childString: '',
        childSeparator: null,
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: null,
        childString: '',
        childSeparator: '',
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: null,
        childString: '',
        childSeparator: '__',
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: null,
        childString: 'child',
        childSeparator: null,
        prefix: 'child.',
        suffix: '.child',
      },
      {
        parentString: '',
        parentSeparator: null,
        childString: 'child',
        childSeparator: '',
        prefix: 'child',
        suffix: 'child',
      },
      {
        parentString: '',
        parentSeparator: null,
        childString: 'child',
        childSeparator: '__',
        prefix: 'child__',
        suffix: '__child',
      },
      {
        parentString: '',
        parentSeparator: '',
        childString: null,
        childSeparator: null,
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: '',
        childString: null,
        childSeparator: '',
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: '',
        childString: null,
        childSeparator: '__',
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: '',
        childString: '',
        childSeparator: null,
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: '',
        childString: '',
        childSeparator: '',
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: '',
        childString: '',
        childSeparator: '__',
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: '',
        childString: 'child',
        childSeparator: null,
        prefix: 'child.',
        suffix: '.child',
      },
      {
        parentString: '',
        parentSeparator: '',
        childString: 'child',
        childSeparator: '',
        prefix: 'child',
        suffix: 'child',
      },
      {
        parentString: '',
        parentSeparator: '',
        childString: 'child',
        childSeparator: '__',
        prefix: 'child__',
        suffix: '__child',
      },
      {
        parentString: '',
        parentSeparator: '__',
        childString: null,
        childSeparator: null,
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: '__',
        childString: null,
        childSeparator: '',
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: '__',
        childString: null,
        childSeparator: '__',
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: '__',
        childString: '',
        childSeparator: null,
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: '__',
        childString: '',
        childSeparator: '',
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: '__',
        childString: '',
        childSeparator: '__',
        prefix: '',
        suffix: '',
      },
      {
        parentString: '',
        parentSeparator: '__',
        childString: 'child',
        childSeparator: null,
        prefix: 'child.',
        suffix: '.child',
      },
      {
        parentString: '',
        parentSeparator: '__',
        childString: 'child',
        childSeparator: '',
        prefix: 'child',
        suffix: 'child',
      },
      {
        parentString: '',
        parentSeparator: '__',
        childString: 'child',
        childSeparator: '__',
        prefix: 'child__',
        suffix: '__child',
      },
      {
        parentString: 'parent',
        parentSeparator: null,
        childString: null,
        childSeparator: null,
        prefix: 'parent.',
        suffix: '.parent',
      },
      {
        parentString: 'parent',
        parentSeparator: null,
        childString: null,
        childSeparator: '',
        prefix: 'parent.',
        suffix: '.parent',
      },
      {
        parentString: 'parent',
        parentSeparator: null,
        childString: null,
        childSeparator: '__',
        prefix: 'parent.',
        suffix: '.parent',
      },
      {
        parentString: 'parent',
        parentSeparator: null,
        childString: '',
        childSeparator: null,
        prefix: 'parent.',
        suffix: '.parent',
      },
      {
        parentString: 'parent',
        parentSeparator: null,
        childString: '',
        childSeparator: '',
        prefix: 'parent.',
        suffix: '.parent',
      },
      {
        parentString: 'parent',
        parentSeparator: null,
        childString: '',
        childSeparator: '__',
        prefix: 'parent.',
        suffix: '.parent',
      },
      {
        parentString: 'parent',
        parentSeparator: null,
        childString: 'child',
        childSeparator: null,
        prefix: 'parent.child.',
        suffix: '.child.parent',
      },
      {
        parentString: 'parent',
        parentSeparator: null,
        childString: 'child',
        childSeparator: '',
        prefix: 'parent.child',
        suffix: 'child.parent',
      },
      {
        parentString: 'parent',
        parentSeparator: null,
        childString: 'child',
        childSeparator: '__',
        prefix: 'parent.child__',
        suffix: '__child.parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '',
        childString: null,
        childSeparator: null,
        prefix: 'parent',
        suffix: 'parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '',
        childString: null,
        childSeparator: '',
        prefix: 'parent',
        suffix: 'parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '',
        childString: null,
        childSeparator: '__',
        prefix: 'parent',
        suffix: 'parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '',
        childString: '',
        childSeparator: null,
        prefix: 'parent',
        suffix: 'parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '',
        childString: '',
        childSeparator: '',
        prefix: 'parent',
        suffix: 'parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '',
        childString: '',
        childSeparator: '__',
        prefix: 'parent',
        suffix: 'parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '',
        childString: 'child',
        childSeparator: null,
        prefix: 'parentchild.',
        suffix: '.childparent',
      },
      {
        parentString: 'parent',
        parentSeparator: '',
        childString: 'child',
        childSeparator: '',
        prefix: 'parentchild',
        suffix: 'childparent',
      },
      {
        parentString: 'parent',
        parentSeparator: '',
        childString: 'child',
        childSeparator: '__',
        prefix: 'parentchild__',
        suffix: '__childparent',
      },
      {
        parentString: 'parent',
        parentSeparator: '__',
        childString: null,
        childSeparator: null,
        prefix: 'parent__',
        suffix: '__parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '__',
        childString: null,
        childSeparator: '',
        prefix: 'parent__',
        suffix: '__parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '__',
        childString: null,
        childSeparator: '__',
        prefix: 'parent__',
        suffix: '__parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '__',
        childString: '',
        childSeparator: null,
        prefix: 'parent__',
        suffix: '__parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '__',
        childString: '',
        childSeparator: '',
        prefix: 'parent__',
        suffix: '__parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '__',
        childString: '',
        childSeparator: '__',
        prefix: 'parent__',
        suffix: '__parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '__',
        childString: 'child',
        childSeparator: null,
        prefix: 'parent__child.',
        suffix: '.child__parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '__',
        childString: 'child',
        childSeparator: '',
        prefix: 'parent__child',
        suffix: 'child__parent',
      },
      {
        parentString: 'parent',
        parentSeparator: '__',
        childString: 'child',
        childSeparator: '__',
        prefix: 'parent__child__',
        suffix: '__child__parent',
      },
    ].forEach((spec) => {
      const {parentString, parentSeparator, childString, childSeparator, prefix, suffix} = spec;
      it(`generates the correct strings for spec: ${JSON.stringify(spec)}`, () => {
        // if we don't null out the server first, and try to close it again, we get an uncatchable error when using uds
        server = null;

        // console.log("setting up parent");

        statsd = new StatsD({
          prefix: parentString,
          prefixSeparator: parentSeparator,
          suffix: parentString,
          suffixSeparator: parentSeparator,
        });

        // console.log("setting up child");

        const child = statsd.childClient({
          prefix: childString,
          prefixSeparator: childSeparator,
          suffix: childString,
          suffixSeparator: childSeparator,
        });

        // console.log("passed setup");

        console.log(JSON.stringify(statsd.prefix), JSON.stringify(statsd.suffix))

        assert.strictEqual(child.prefix, prefix);
        // console.log("passed first assertion");
        assert.strictEqual(child.suffix, suffix);
        // console.log("passed second assertion");
      });
    });
  });
});
