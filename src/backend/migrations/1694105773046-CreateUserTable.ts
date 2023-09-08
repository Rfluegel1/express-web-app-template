import {MigrationInterface, QueryRunner} from 'typeorm'

export class CreateUserTable1694105773046 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE users ( ' +
            'id UUID PRIMARY KEY, ' +
            'email VARCHAR UNIQUE NOT NULL, ' +
            'password VARCHAR NOT NULL, ' +
            'isVerified BOOLEAN DEFAULT false ' +
            ')',
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'DROP TABLE posts'
        )

    }

}
