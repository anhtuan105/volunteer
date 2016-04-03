class ProvinceController < ApplicationController
	def show
		@provinces = Province.all
	end
end
