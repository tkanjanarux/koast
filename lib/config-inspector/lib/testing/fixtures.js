exports.debugInfo = [{
  "path": "section1",
  "resultValue": {
    "key1": "app default",
    "key2": "base default"
  },
  "base": {
    "default": {
      "preProcessed": {
        "key1": "base default",
        "key2": "base default"
      },
      "postProcessed": {
        "key1": "base default",
        "key2": "base default"
      }
    },
    "environment": {
      "preProcessed": {
        "key1": "base env"
      },
      "postProcessed": {
        "key1": "app default",
        "key2": "base default"
      }
    }
  },
  "app": {
    "default": {
      "preProcessed": {
        "key1": "app default"
      },
      "postProcessed": {
        "key1": "app default"
      }
    },
    "environment": {
      "postProcessed": {
        "key1": "app default"
      }
    }
  },
  "baseDefaultValue": {
    "key1": "base default",
    "key2": "base default"
  },
  "baseEnvironmentValue": {
    "key1": "app default",
    "key2": "base default"
  },
  "appDefaultValue": {
    "key1": "app default"
  },
  "appEnvironmentValue": {
    "key1": "app default"
  },
  "valueSource": "appEnvironment",
  "valueConfig": "/app/config/configurationInfoTest.json"
}, {
  "path": "section1.key1",
  "resultValue": "app default",
  "base": {
    "default": {
      "preProcessed": "base default",
      "postProcessed": "base default"
    },
    "environment": {
      "preProcessed": "base env",
      "postProcessed": "app default"
    }
  },
  "app": {
    "default": {
      "preProcessed": "app default",
      "postProcessed": "app default"
    },
    "environment": {
      "postProcessed": "app default"
    }
  },
  "baseDefaultValue": "base default",
  "baseEnvironmentValue": "app default",
  "appDefaultValue": "app default",
  "appEnvironmentValue": "app default",
  "valueSource": "appDefault",
  "valueConfig": "/app/config/app.json"
}, {
  "path": "section1.key2",
  "resultValue": "base default",
  "base": {
    "default": {
      "preProcessed": "base default",
      "postProcessed": "base default"
    },
    "environment": {
      "postProcessed": "base default"
    }
  },
  "app": {
    "default": {},
    "environment": {}
  },
  "baseDefaultValue": "base default",
  "baseEnvironmentValue": "base default",
  "valueSource": "baseDefault",
  "valueConfig": "/base/config/app.json"
}, {
  "path": "section2",
  "resultValue": {
    "key1": "app default"
  },
  "base": {
    "default": {
      "preProcessed": {
        "key1": "base default"
      },
      "postProcessed": {
        "key1": "base default"
      }
    },
    "environment": {
      "postProcessed": {
        "key1": "app default"
      }
    }
  },
  "app": {
    "default": {
      "preProcessed": {
        "key1": "app default"
      },
      "postProcessed": {
        "key1": "app default"
      }
    },
    "environment": {
      "postProcessed": {
        "key1": "app default"
      }
    }
  },
  "baseDefaultValue": {
    "key1": "base default"
  },
  "baseEnvironmentValue": {
    "key1": "app default"
  },
  "appDefaultValue": {
    "key1": "app default"
  },
  "appEnvironmentValue": {
    "key1": "app default"
  },
  "valueSource": "appEnvironment",
  "valueConfig": "/app/config/configurationInfoTest.json"
}, {
  "path": "section2.key1",
  "resultValue": "app default",
  "base": {
    "default": {
      "preProcessed": "base default",
      "postProcessed": "base default"
    },
    "environment": {
      "postProcessed": "app default"
    }
  },
  "app": {
    "default": {
      "preProcessed": "app default",
      "postProcessed": "app default"
    },
    "environment": {
      "postProcessed": "app default"
    }
  },
  "baseDefaultValue": "base default",
  "baseEnvironmentValue": "app default",
  "appDefaultValue": "app default",
  "appEnvironmentValue": "app default",
  "valueSource": "appDefault",
  "valueConfig": "/app/config/app.json"
}, {
  "path": "section4",
  "resultValue": {
    "key1": "test",
    "key2": "app env"
  },
  "base": {
    "default": {
      "preProcessed": {
        "key1": "env:___RANDOM__TEST"
      },
      "postProcessed": {
        "key1": "test"
      }
    },
    "environment": {
      "postProcessed": {
        "key1": "test",
        "key2": "app env"
      }
    }
  },
  "app": {
    "default": {},
    "environment": {
      "preProcessed": {
        "key2": "app env"
      },
      "postProcessed": {
        "key2": "app env"
      }
    }
  },
  "baseDefaultValue": {
    "key1": "test"
  },
  "baseEnvironmentValue": {
    "key1": "test",
    "key2": "app env"
  },
  "appEnvironmentValue": {
    "key2": "app env"
  },
  "valueSource": "appEnvironment",
  "valueConfig": "/app/config/configurationInfoTest.json"
}, {
  "path": "section4.key1",
  "resultValue": "test",
  "base": {
    "default": {
      "preProcessed": "env:___RANDOM__TEST",
      "postProcessed": "test"
    },
    "environment": {
      "postProcessed": "test"
    }
  },
  "app": {
    "default": {},
    "environment": {}
  },
  "baseDefaultValue": "test",
  "baseEnvironmentValue": "test",
  "valueSource": "baseDefault",
  "valueConfig": "/base/config/app.json"
}, {
  "path": "section4.key2",
  "resultValue": "app env",
  "base": {
    "default": {},
    "environment": {
      "postProcessed": "app env"
    }
  },
  "app": {
    "default": {},
    "environment": {
      "preProcessed": "app env",
      "postProcessed": "app env"
    }
  },
  "baseEnvironmentValue": "app env",
  "appEnvironmentValue": "app env",
  "valueSource": "appEnvironment",
  "valueConfig": "/app/config/configurationInfoTest.json"
}, {
  "path": "section5",
  "resultValue": {
    "key1": "base env",
    "key2": "test"
  },
  "base": {
    "default": {},
    "environment": {
      "preProcessed": {
        "key1": "base env",
        "key2": "env:___RANDOM__TEST"
      },
      "postProcessed": {
        "key1": "base env",
        "key2": "test"
      }
    }
  },
  "app": {
    "default": {},
    "environment": {}
  },
  "baseEnvironmentValue": {
    "key1": "base env",
    "key2": "test"
  },
  "valueSource": "baseEnvironment",
  "valueConfig": "/base/config/configurationInfoTest.json"
}, {
  "path": "section5.key1",
  "resultValue": "base env",
  "base": {
    "default": {},
    "environment": {
      "preProcessed": "base env",
      "postProcessed": "base env"
    }
  },
  "app": {
    "default": {},
    "environment": {}
  },
  "baseEnvironmentValue": "base env",
  "valueSource": "baseEnvironment",
  "valueConfig": "/base/config/configurationInfoTest.json"
}, {
  "path": "section5.key2",
  "resultValue": "test",
  "base": {
    "default": {},
    "environment": {
      "preProcessed": "env:___RANDOM__TEST",
      "postProcessed": "test"
    }
  },
  "app": {
    "default": {},
    "environment": {}
  },
  "baseEnvironmentValue": "test",
  "valueSource": "baseEnvironment",
  "valueConfig": "/base/config/configurationInfoTest.json"
}, {
  "path": "section6",
  "resultValue": {
    "key1": "app env",
    "key2": "test"
  },
  "base": {
    "default": {},
    "environment": {}
  },
  "app": {
    "default": {},
    "environment": {
      "preProcessed": {
        "key1": "app env",
        "key2": "env:___RANDOM__TEST"
      },
      "postProcessed": {
        "key1": "app env",
        "key2": "test"
      }
    }
  },
  "appEnvironmentValue": {
    "key1": "app env",
    "key2": "test"
  },
  "valueSource": "appEnvironment",
  "valueConfig": "/app/config/configurationInfoTest.json"
}, {
  "path": "section6.key1",
  "resultValue": "app env",
  "base": {
    "default": {},
    "environment": {}
  },
  "app": {
    "default": {},
    "environment": {
      "preProcessed": "app env",
      "postProcessed": "app env"
    }
  },
  "appEnvironmentValue": "app env",
  "valueSource": "appEnvironment",
  "valueConfig": "/app/config/configurationInfoTest.json"
}, {
  "path": "section6.key2",
  "resultValue": "test",
  "base": {
    "default": {},
    "environment": {}
  },
  "app": {
    "default": {},
    "environment": {
      "preProcessed": "env:___RANDOM__TEST",
      "postProcessed": "test"
    }
  },
  "appEnvironmentValue": "test",
  "valueSource": "appEnvironment",
  "valueConfig": "/app/config/configurationInfoTest.json"
}, {
  "path": "section3",
  "resultValue": {
    "key1": "app env",
    "key2": "test"
  },
  "base": {
    "default": {},
    "environment": {}
  },
  "app": {
    "default": {
      "preProcessed": {
        "key1": "app default",
        "key2": "env:___RANDOM__TEST"
      },
      "postProcessed": {
        "key1": "app default",
        "key2": "test"
      }
    },
    "environment": {
      "preProcessed": {
        "key1": "app env"
      },
      "postProcessed": {
        "key1": "app env",
        "key2": "test"
      }
    }
  },
  "appDefaultValue": {
    "key1": "app default",
    "key2": "test"
  },
  "appEnvironmentValue": {
    "key1": "app env",
    "key2": "test"
  },
  "valueSource": "appEnvironment",
  "valueConfig": "/app/config/configurationInfoTest.json"
}, {
  "path": "section3.key1",
  "resultValue": "app env",
  "base": {
    "default": {},
    "environment": {}
  },
  "app": {
    "default": {
      "preProcessed": "app default",
      "postProcessed": "app default"
    },
    "environment": {
      "preProcessed": "app env",
      "postProcessed": "app env"
    }
  },
  "appDefaultValue": "app default",
  "appEnvironmentValue": "app env",
  "valueSource": "appEnvironment",
  "valueConfig": "/app/config/configurationInfoTest.json"
}, {
  "path": "section3.key2",
  "resultValue": "test",
  "base": {
    "default": {},
    "environment": {}
  },
  "app": {
    "default": {
      "preProcessed": "env:___RANDOM__TEST",
      "postProcessed": "test"
    },
    "environment": {
      "postProcessed": "test"
    }
  },
  "appDefaultValue": "test",
  "appEnvironmentValue": "test",
  "valueSource": "appDefault",
  "valueConfig": "/app/config/app.json"
}];

exports.configInfo = {
  "base": {
    "defaultSource": "/base/config/app.json",
    "environmentSource": "/base/config/configurationInfoTest.json",
    "default": {
      "preProcessed": {
        "section1": {
          "key1": "base default",
          "key2": "base default"
        },
        "section2": {
          "key1": "base default"
        },
        "section4": {
          "key1": "env:___RANDOM__TEST"
        }
      },
      "postProcessed": {
        "section1": {
          "key1": "base default",
          "key2": "base default"
        },
        "section2": {
          "key1": "base default"
        },
        "section4": {
          "key1": "test"
        }
      }
    },
    "environment": {
      "preProcessed": {
        "section1": {
          "key1": "base env"
        },
        "section5": {
          "key1": "base env",
          "key2": "env:___RANDOM__TEST"
        }
      },
      "postProcessed": {
        "section1": {
          "key1": "app default",
          "key2": "base default"
        },
        "section2": {
          "key1": "app default"
        },
        "section4": {
          "key1": "test",
          "key2": "app env"
        },
        "section5": {
          "key1": "base env",
          "key2": "test"
        }
      }
    }
  },
  "app": {
    "defaultSource": "/app/config/app.json",
    "environmentSource": "/app/config/configurationInfoTest.json",
    "default": {
      "preProcessed": {
        "section1": {
          "key1": "app default"
        },
        "section2": {
          "key1": "app default"
        },
        "section3": {
          "key1": "app default",
          "key2": "env:___RANDOM__TEST"
        },
        "error": {
          "400": true
        },
        "someArray": {
          "values": [
            0,
            1,
            2
          ]
        }
      },
      "postProcessed": {
        "error": {
          "400": true
        },
        "someArray": {
          "values": [
            0,
            1,
            2
          ]
        },
        "section1": {
          "key1": "app default"
        },
        "section2": {
          "key1": "app default"
        },
        "section3": {
          "key1": "app default",
          "key2": "test"
        }
      }
    },
    "environment": {
      "preProcessed": {
        "section3": {
          "key1": "app env"
        },
        "section4": {
          "key2": "app env"
        },
        "section6": {
          "key1": "app env",
          "key2": "env:___RANDOM__TEST"
        }
      },
      "postProcessed": {
        "section1": {
          "key1": "app default"
        },
        "section2": {
          "key1": "app default"
        },
        "section4": {
          "key2": "app env"
        },
        "section3": {
          "key1": "app env",
          "key2": "test"
        },
        "section6": {
          "key1": "app env",
          "key2": "test"
        }
      }
    }
  },
  "result": {
    "section1": {
      "key1": "app default",
      "key2": "base default"
    },
    "section2": {
      "key1": "app default"
    },
    "section4": {
      "key1": "test",
      "key2": "app env"
    },
    "section5": {
      "key1": "base env",
      "key2": "test"
    },
    "section6": {
      "key1": "app env",
      "key2": "test"
    },
    "section3": {
      "key1": "app env",
      "key2": "test"
    },
    "error": {
      "400": true
    },
    "someArray": {
      "values": [
        0,
        1,
        2
      ]
    }
  }
};