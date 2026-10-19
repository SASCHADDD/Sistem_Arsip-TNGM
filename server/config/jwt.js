const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET wajib diatur dan harus memiliki panjang minimal 32 karakter.');
}

module.exports = { jwtSecret };
