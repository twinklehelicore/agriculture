import prisma from '../lib/prisma';

export const getAdminId = async (): Promise<number | null> => {
  const admin = await prisma.user.findFirst({
    where: { role: { name: 'ADMIN' } }
  });
  return admin?.id ?? null;
};