export const onlyUserOrAdmin = (req, res, next) => {
    if (
        req.currentUserId !== req.params.id &&
        !req.currentUserPermissions.includes('admin')
    ) {
        return res
            .status(403)
            .json({
                message: 'You are not authorized to perform this action.',
            });
    }
    next();
};
