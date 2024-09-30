import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';
import e from 'express';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;
    } catch (error) {
      this.handleException(error)
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(id: string) {
    let pokemon: Pokemon;

    if (!isNaN(+id)) {
      pokemon = await this.pokemonModel.findOne({ no: id });
    }

    if (!pokemon && isValidObjectId(id)) {
      pokemon = await this.pokemonModel.findById(id);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: id.toLowerCase });
    }

    if (!pokemon) throw new NotFoundException(`Pokemon with id ${id} not found`);

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto, {new: true});
  
      return {...pokemon.toJSON(), ...updatePokemonDto};
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    const {deletedCount} = await this.pokemonModel.deleteOne({ _id: id });

    if (deletedCount === 0)
      throw new BadRequestException(`Pokemon with id ${id} not found`)

    return;
  }

  private handleException(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon already exists in the database ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log(error);
    throw new InternalServerErrorException(
      `Error creating the pokemon ${error.message}`,
    );
  }

}

