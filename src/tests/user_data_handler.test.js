const assert = require('assert')
const sinon = require('sinon')
const axios = require('axios')

const UserDataHandler = require('../../src/data_handlers/user_data_handler')

describe('[User Data Handler Suit] ->', () => {
  let userDataHandler
  let axiosGetStub

  beforeEach(() => {
    userDataHandler = new UserDataHandler()
    axiosGetStub = sinon.stub(axios, 'get')
  })

  afterEach(() => {
    axiosGetStub.restore()
  })

  it('Should fetch user data from the server', async () => {
    const users = [
      {
        id: 1,
        name: 'Leanne Graham',
        username: 'Bret',
        email: 'Sincere@april.biz'
      }
    ]

    axiosGetStub.resolves({ data: users })
    await userDataHandler.loadUsers()

    assert.deepStrictEqual(userDataHandler.users, users)
  })

  it('Should handle errors during data fetching', async () => {
    axiosGetStub.rejects(new Error('Network Error'))

    await assert.rejects(userDataHandler.loadUsers(), {
      message: 'Failed to load users data: Error: Network Error'
    })
  })

  it('Should get a list of user emails', () => {
    userDataHandler.users = [
      { email: 'email1@example.com' },
      { email: 'email2@example.com' }
    ]

    const expected = 'email1@example.com;email2@example.com'
    const result = userDataHandler.getUserEmailsList()

    assert.strictEqual(result, expected)
  })

  it('Should get the number of users', () => {
    userDataHandler.users = [{ id: 1 }, { id: 2 }]

    const expected = 2
    const result = userDataHandler.getNumberOfUsers()

    assert.strictEqual(result, expected)
  })

  it('Should check if a user matches all search parameters', () => {
    const user = {
      id: 1,
      name: 'John Doe',
      age: 25
    }

    const searchParams = {
      id: 1,
      name: 'John Doe',
      age: 25
    }

    const result = userDataHandler.isMatchingAllSearchParams(
      user,
      searchParams
    )

    assert.strictEqual(result, true)
  })

  it('Should find users matching the search parameters', () => {
    userDataHandler.users = [
      {
        id: 1,
        name: 'John Doe',
        age: 25
      },
      {
        id: 2,
        name: 'Jane Smith',
        age: 30
      }
    ]

    const searchParams = { age: 25 }

    const expected = [
      {
        id: 1,
        name: 'John Doe',
        age: 25
      }
    ]

    const result = userDataHandler.findUsers(searchParams)

    assert.deepStrictEqual(result, expected)
  })

  it('Should throw an error if no users are loaded', () => {
    userDataHandler.users = []
    const searchParams = { age: 25 }

    assert.throws(
      () => {
        userDataHandler.findUsers(searchParams)
      },
      (error) => {
        return error.message === 'No users loaded!'
      }
    )
  })

  it('should throw an error if no search parameters are provided', () => {
    assert.throws(
      () => {
        userDataHandler.getUserEmailsList()
      },
      { message: 'No users loaded!' }
    )
  })

  it('Should throw an error if no search parameters are provided', () => {
    assert.throws(
      () => {
        userDataHandler.findUsers(undefined)
      },
      error => {
        return error.message === 'No search parameters provoded!'
      }
    )
  })

  it('Should throw an error if no matching users are found', () => {
    userDataHandler.users = [
      { id: 1, name: 'John Doe', age: 25 },
      { id: 2, name: 'Jane Smith', age: 30 }
    ]

    const searchParams = { age: 40 }

    assert.throws(
      () => {
        userDataHandler.findUsers(searchParams)
      },
      { message: 'No matching users found!' }
    )
  })
})
