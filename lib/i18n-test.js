var i18n = require('./i18n');
var tr = i18n.translate;
var expect = require('chai').expect;

describe('i18n translate function', function () {
  before(function () {
    i18n.dictionary = {
      en: {
        "hello {{text}}": "HELLO {{text}}",
        "test": {
          "hello": {
            "Hi, {{name}}!": "Hello, {{name}}!"
          }
        }
      }
    };
  });

  describe('hello {{text}}', function () {
    it('should equal to hello {{text}} if no context', function () {
      expect(tr('hello {{text}}', 'en')).to.equal('HELLO {{text}}');
    });

    it('should equal to hello world', function () {
      expect(tr('hello {{text}}', 'en', {
        text: 'world'
      })).to.equal('HELLO world');
    });
  });

  describe('test::hello::Hi, {{name}}!', function () {
    var input = 'test::hello::Hi, {{name}}!';

    it('should equal to Hello, {{name}}!', function () {
      expect(tr(input, 'en')).to.equal('Hello, {{name}}!');
    });

    it('should equal to Hello, {{name}}!', function () {
      expect(tr(input, 'en', {NAME: 'world'})).to.equal('Hello, {{name}}!');
    });

    it('should equal to Hello, world!', function () {
      expect(tr(input, 'en', {name: 'world'})).to.equal('Hello, world!');
    });
  });

  describe('test::hello::Hi, {{ first }} {{ last }}!', function () {
    var input = 'test::hello::Hi, {{ first }} {{ last }}!';

    it('should equal to Hi, {{ first }} {{ last }}!', function () {
      expect(tr(input, 'en')).to.equal('Hi, {{ first }} {{ last }}!');
    });

    it('should equal to Hi, Matt {{ last }}!', function () {
      expect(tr(input, 'en', {first: 'Matt'})).to.equal('Hi, Matt {{ last }}!');
    });

    it('should equal to Hi, {{ first }} Damon!', function () {
      expect(tr(input, 'en', {last: 'Damon'})).to.
        equal('Hi, {{ first }} Damon!');
    });

    it('should equal to Hi, Matt Damon!', function () {
      expect(tr(input, 'en', {
        first: 'Matt',
        last: 'Damon'
      })).to.equal('Hi, Matt Damon!');
    });
  });

  describe('test::Hi, {{distributed.revision.control.system}}!',
  function () {
    var input = 'test::Hi, {{distributed.revision.control.system}}!';

    it('should equal to Hi, {{distributed.revision.control.system}}!',
    function () {
      expect(tr(input, 'en')).to.
        equal('Hi, {{distributed.revision.control.system}}!');
    });

    it('should equal to Hi, {{distributed.revision.control.system}}!',
    function () {
      expect(tr(input, 'en', {
        distributed: {
          revision: {
            control: {
            }
          }
        }
      })).to.equal('Hi, {{distributed.revision.control.system}}!');
    });

    it('should equal to Hi, Git!', function () {
      expect(tr(input, 'en', {
        distributed: {
          revision: {
            control: {
              system: 'Git'
            }
          }
        }
      })).to.equal('Hi, Git!');
    });

    it('should equal to Hi, ["Git","Mercurial"]!', function () {
      expect(tr(input, 'en', {
        distributed: {
          revision: {
            control: {
              system: ['Git', 'Mercurial']
            }
          }
        }
      })).to.equal('Hi, ["Git","Mercurial"]!');
    });

    it('should equal to Hi, ["Git","Mercurial"]!', function () {
      expect(tr({
        string: input,
        context: {
          distributed: {
            revision: {
              control: {
                system: ['Git', 'Mercurial']
              }
            }
          }
        }
      }, 'en')).to.equal('Hi, ["Git","Mercurial"]!');
    });
  });
});
