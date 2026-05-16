rules

In Call DB always check if isDeleted is true then return error that hall is deleted or not found 

In Call DB for create or update or delete or find always take the required propertis of model or validated  for it and ignore the rest  like this   const { prop1,prop2, prop3 } = data; rely on validate rules






Folder Modules has modules 
each one has it is own files like 
- controller


export const getAllUsersController = async (_req: Request, res: Response) => {
    const users = await UserService.getAllUsers();
    res.status(200).json(users);
};

- routes
router.get(
  PATHS.USER.GET_ALL_USERS,
  authenticate,
  authorize([Role.ADMIN]),
  getAllUsersController,
);

- validation
export const promoteValidation = [
  body("id").notEmpty().withMessage("User ID is required"),
  body('role').notEmpty().withMessage('Role is required').isIn(Object.values(Role)).withMessage('Role must be either ADMIN or USER'),
];


- service
here you should take out the varaibles this will prevent the user from inject any value direct into the database
export const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  return users.map((user) => getUserWithoutPassword(user));
};

- types
- test.ts 
- index.ts to export only the routes 