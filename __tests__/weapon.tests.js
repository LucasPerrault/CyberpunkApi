import request from 'supertest'
import app from '../app'

import * as t from '../cyberpunk';

import {weaponMock1} from "../mocks/weapon.mocks";

jest.mock('../dal.js', () => {
    return jest.fn().mockImplementation(() => ({
        getAllWeaponsAsync: jest.fn(),
    }))
})

beforeEach(() => {
    t.cyberpunk = jest.fn().mockReturnValue({
        getAllWeaponsAsync: jest.fn(),
    })
})

describe('Weapon actions :', () => {
    it('Get all weapons', async () => {
        const expectedResponseBody = [weaponMock1];
        const getAllWeaponsAsync = jest.fn().mockReturnValue(expectedResponseBody);

        t.cyberpunk.mockReturnValue({ getAllWeaponsAsync });

        const res = await request(app).get('/weapons');
        expect(res.status).toBe(200)
        expect(res.body).toEqual(expectedResponseBody)
        expect(getAllWeaponsAsync).toHaveBeenCalledTimes(1)
    })
})
