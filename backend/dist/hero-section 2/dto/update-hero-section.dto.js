"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHeroSectionDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_hero_section_dto_1 = require("./create-hero-section.dto");
class UpdateHeroSectionDto extends (0, mapped_types_1.PartialType)(create_hero_section_dto_1.CreateHeroSectionDto) {
}
exports.UpdateHeroSectionDto = UpdateHeroSectionDto;
//# sourceMappingURL=update-hero-section.dto.js.map