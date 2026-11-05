'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. users
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nickname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      picture: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('OWNER', 'ADMIN', 'USER'),
        allowNull: false,
        defaultValue: 'USER'
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 2. sessions
    await queryInterface.createTable('sessions', {
      sid: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      expires: {
        type: Sequelize.DATE,
        allowNull: false
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
    await queryInterface.addIndex('sessions', ['expires']);

    // 3. Client
    await queryInterface.createTable('Client', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 4. api_key (references Client)
    await queryInterface.createTable('api_key', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      clientId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Client',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      keyId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      keyHash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 5. product
    await queryInterface.createTable('product', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      picture: {
        type: Sequelize.STRING,
        allowNull: false
      },
      logo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      info_header: {
        type: Sequelize.STRING,
        allowNull: false
      },
      info_body: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isAlive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      url: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'NoUrl'
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 6. variant_product (references product)
    await queryInterface.createTable('variant_product', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'product',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      picture: {
        type: Sequelize.STRING,
        allowNull: false
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 7. video_group (timestamps: false)
    await queryInterface.createTable('video_group', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });

    // 8. video (references video_group)
    await queryInterface.createTable('video', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      videoGroupId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'video_group',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      youTubeId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 9. front_page
    await queryInterface.createTable('front_page', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      picture: {
        type: Sequelize.STRING,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      info_header: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 10. about (timestamps: false)
    await queryInterface.createTable('about', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true
      },
      picture: {
        type: Sequelize.STRING,
        allowNull: true
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      imgShow: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });

    // 11. letters
    await queryInterface.createTable('letters', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      mensaje: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tema: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      aprobada: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 12. images (timestamps: false)
    await queryInterface.createTable('images', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      imageUrl: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      }
    });

    // 13. logs
    await queryInterface.createTable('logs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      levelName: {
        type: Sequelize.ENUM('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'),
        allowNull: false
      },
      levelCode: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      stack: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      contexts: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: []
      },
      pid: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      time: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      hostname: {
        type: Sequelize.STRING,
        allowNull: true
      },
      keep: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse dependency order
    await queryInterface.dropTable('logs');
    await queryInterface.dropTable('images');
    await queryInterface.dropTable('letters');
    await queryInterface.dropTable('about');
    await queryInterface.dropTable('front_page');
    await queryInterface.dropTable('video');
    await queryInterface.dropTable('video_group');
    await queryInterface.dropTable('variant_product');
    await queryInterface.dropTable('product');
    await queryInterface.dropTable('api_key');
    await queryInterface.dropTable('Client');
    await queryInterface.dropTable('sessions');
    await queryInterface.dropTable('users');

    // Clean up PostgreSQL ENUM types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_logs_levelName";');
  }
};
