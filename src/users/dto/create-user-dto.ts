export class CreateUserDto {
	readonly name: string;
	readonly age: string;
	readonly sex: 'male' | 'female';
}
