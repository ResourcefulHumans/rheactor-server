import {AccessDeniedError} from '@resourcefulhumans/rheactor-errors'

export default (req, userRepo) => userRepo.getById(req.user)
  .then(admin => {
    if (!admin.superUser) throw new AccessDeniedError(req.url, 'SuperUser privileges required.')
    return admin
  })
